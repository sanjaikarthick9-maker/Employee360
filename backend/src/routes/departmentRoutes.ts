import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireRole('ADMIN'), createDepartment);
router.put('/:id', requireRole('ADMIN'), updateDepartment);
router.delete('/:id', requireRole('ADMIN'), deleteDepartment);

export default router;
