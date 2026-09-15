import { BackupService } from './backupService.js';

async function run() {
  console.log('--- EXECUTING SCHEDULED/MANUAL BACKUP ---');
  try {
    const result = await BackupService.executeBackup();
    console.log('[SUCCESS] Backup completed:', result);
    process.exit(0);
  } catch (err) {
    console.error('[FAILURE] Backup execution failed:', err);
    process.exit(1);
  }
}

run();
