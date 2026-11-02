import { Router } from 'express';
import {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAttendance);
router.post('/', markAttendance);
router.put('/:id', requireRole('ADMIN'), updateAttendance);
router.delete('/:id', requireRole('ADMIN'), deleteAttendance);

export default router;
