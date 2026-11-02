import { Router } from 'express';
import {
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from '../controllers/payrollController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getPayroll);
router.post('/', requireRole('ADMIN'), createPayroll);
router.put('/:id', requireRole('ADMIN'), updatePayroll);
router.delete('/:id', requireRole('ADMIN'), deletePayroll);

export default router;
