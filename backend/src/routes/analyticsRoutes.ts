import { Router } from 'express';
import {
  getEmployeeAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPayrollAnalytics,
  getHiringAnalytics,
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/employees', getEmployeeAnalytics);
router.get('/attendance', getAttendanceAnalytics);
router.get('/leaves', getLeaveAnalytics);
router.get('/payroll', getPayrollAnalytics);
router.get('/hiring', getHiringAnalytics);

export default router;
