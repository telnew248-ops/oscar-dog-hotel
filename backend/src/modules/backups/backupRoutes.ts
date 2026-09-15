import { Router } from 'express';
import { BackupController } from './backupController.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/status', BackupController.getHealth);
router.post('/trigger', BackupController.trigger);

export const backupRoutes = router;
