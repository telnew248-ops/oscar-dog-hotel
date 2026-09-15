import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query } from '../../database/index.js';
import { config } from '../../config/index.js';
import { google } from 'googleapis';

export class BackupService {
  /**
   * Run Database Backup (dumps JSON/SQL state, encrypts with AES-256, uploads/saves)
   */
  static async executeBackup(): Promise<{ id: string; identifier: string; size: number }> {
    const backupIdentifier = `backup_${Date.now()}_${new Date().toISOString().split('T')[0]}`;
    const startedAt = new Date();

    // 1. Log attempt in backup_logs
    const logRes = await query(
      `
      INSERT INTO backup_logs (backup_identifier, status, started_at)
      VALUES ($1, 'RUNNING', $2)
      RETURNING id;
      `,
      [backupIdentifier, startedAt.toISOString()]
    );
    const logId = logRes.rows[0].id;

    try {
      // 2. Extract database state
      const dogs = await query('SELECT * FROM dogs');
      const owners = await query('SELECT * FROM owners');
      const bookings = await query('SELECT * FROM bookings');
      const history = await query('SELECT * FROM status_history');
      const settings = await query('SELECT * FROM application_settings');
      const audit = await query('SELECT * FROM audit_logs');

      const payload = JSON.stringify(
        {
          backupIdentifier,
          timestamp: startedAt.toISOString(),
          tables: {
            dogs: dogs.rows,
            owners: owners.rows,
            bookings: bookings.rows,
            statusHistory: history.rows,
            settings: settings.rows,
            audit: audit.rows
          }
        },
        null,
        2
      );

      // 3. Encrypt payload with AES-256-CBC
      const key = crypto.scryptSync(config.backup.encryptionKey, 'oscar_salt_2026', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(payload, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const backupArtifact = JSON.stringify({
        identifier: backupIdentifier,
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        createdAt: startedAt.toISOString()
      });

      const sizeBytes = Buffer.byteLength(backupArtifact, 'utf8');

      // 4. Save to local backups directory
      const backupsDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      const localFilePath = path.join(backupsDir, `${backupIdentifier}.enc.json`);
      fs.writeFileSync(localFilePath, backupArtifact, 'utf8');

      // 5. Upload to Google Drive if credentials are configured
      let driveUploadId = null;
      if (config.backup.clientEmail && config.backup.privateKey && config.backup.folderId) {
        try {
          const auth = new google.auth.JWT({
            email: config.backup.clientEmail,
            key: config.backup.privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file']
          });

          const drive = google.drive({ version: 'v3', auth });
          const fileMetadata = {
            name: `${backupIdentifier}.enc.json`,
            parents: [config.backup.folderId]
          };
          const media = {
            mimeType: 'application/json',
            body: fs.createReadStream(localFilePath)
          };

          const driveRes = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
          });
          driveUploadId = driveRes.data.id;
          console.log(`[BACKUP] Successfully uploaded to Google Drive with ID: ${driveUploadId}`);
        } catch (driveErr: any) {
          console.warn('[BACKUP WARNING] Google Drive upload failed, local backup preserved:', driveErr.message);
        }
      }

      // 6. Prune old backups (Retention Policy)
      this.pruneOldBackups(backupsDir, config.backup.retentionDays);

      // 7. Update backup log to SUCCESS
      await query(
        `
        UPDATE backup_logs
        SET status = 'SUCCESS',
            file_size_bytes = $1,
            completed_at = NOW()
        WHERE id = $2;
        `,
        [sizeBytes, logId]
      );

      return {
        id: logId,
        identifier: backupIdentifier,
        size: sizeBytes
      };
    } catch (err: any) {
      // Record failure for observability
      await query(
        `
        UPDATE backup_logs
        SET status = 'FAILED',
            failure_reason = $1,
            completed_at = NOW()
        WHERE id = $2;
        `,
        [err.message || 'Unknown backup error', logId]
      );
      throw err;
    }
  }

  /**
   * Retention policy: remove backup files older than retentionDays
   */
  private static pruneOldBackups(dir: string, days: number): void {
    try {
      const now = Date.now();
      const maxAgeMs = days * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(dir);

      for (const file of files) {
        if (!file.endsWith('.enc.json')) continue;
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`[BACKUP PRUNE] Removed expired backup: ${file}`);
        }
      }
    } catch (err) {
      console.warn('[BACKUP PRUNE] Error during pruning:', err);
    }
  }

  /**
   * Observable Backup Health Status
   */
  static async getBackupHealth() {
    const lastSuccessRes = await query(
      `
      SELECT * FROM backup_logs
      WHERE status = 'SUCCESS'
      ORDER BY completed_at DESC
      LIMIT 1;
      `
    );

    const lastAttemptRes = await query(
      `
      SELECT * FROM backup_logs
      ORDER BY started_at DESC
      LIMIT 1;
      `
    );

    const historyRes = await query(
      `
      SELECT * FROM backup_logs
      ORDER BY started_at DESC
      LIMIT 10;
      `
    );

    const countRes = await query("SELECT COUNT(*)::int as c FROM backup_logs WHERE status = 'SUCCESS'");
    const totalSuccessfulBackups = countRes.rows[0]?.c || 0;
    const isHealthy = lastSuccessRes.rowCount !== 0;

    return {
      status: isHealthy ? 'HEALTHY' : 'NEEDS_ATTENTION',
      healthy: isHealthy,
      totalSuccessfulBackups,
      lastBackup: lastSuccessRes.rows[0] || null,
      lastSuccessfulBackup: lastSuccessRes.rows[0] || null,
      lastAttemptedBackup: lastAttemptRes.rows[0] || null,
      retentionDaysConfigured: config.backup.retentionDays,
      googleDriveConfigured: Boolean(config.backup.clientEmail && config.backup.folderId),
      recentLogs: historyRes.rows
    };
  }
}
