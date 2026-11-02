import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', requireRole('ADMIN'), createEmployee);
router.put('/:id', requireRole('ADMIN'), updateEmployee);
router.delete('/:id', requireRole('ADMIN'), deleteEmployee);

export default router;
