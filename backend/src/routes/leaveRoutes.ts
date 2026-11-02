import { Router } from 'express';
import {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  cancelLeave,
} from '../controllers/leaveController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeaves);
router.post('/', applyLeave);
router.put('/:id/status', requireRole('ADMIN'), updateLeaveStatus);
router.put('/:id/cancel', cancelLeave);

export default router;
