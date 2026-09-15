import { Request, Response, NextFunction } from 'express';
import { BackupService } from './backupService.js';

export class BackupController {
  static async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await BackupService.getBackupHealth();
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (err) {
      next(err);
    }
  }

  static async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BackupService.executeBackup();
      res.status(200).json({
        success: true,
        data: {
          message: 'Backup completed successfully',
          backup: result
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
