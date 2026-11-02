import { Request, Response } from 'express';
import { Department } from '../models/Department';
import { Employee } from '../models/Employee';
import { sendSuccess, sendError } from '../utils/response';
import { cacheService } from '../config/redis';

export const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName email').lean();

    // Aggregate employee counts per department
    const counts = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[String(c._id)] = c.count;
    });

    const result = departments.map((d) => ({
      ...d,
      employeeCount: countMap[String(d._id)] || 0,
    }));

    return sendSuccess(res, result, 'Departments retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getDepartmentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const department = await Department.findById(req.params.id).populate('manager');
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }
    const count = await Employee.countDocuments({ department: department._id });
    return sendSuccess(res, { ...department.toObject(), employeeCount: count }, 'Department retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, code, description, manager } = req.body;
    if (!name || !code) {
      return sendError(res, 'Department name and code are required', 400);
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      return sendError(res, 'Department code already in use', 400);
    }

    const existingName = await Department.findOne({ name: name.trim() });
    if (existingName) {
      return sendError(res, 'Department name already in use', 400);
    }

    const newDept = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || '',
      manager: manager || null,
    });

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, newDept, 'Department created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, code } = req.body;
    if (code) {
      const existing = await Department.findOne({
        code: code.toUpperCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return sendError(res, 'Department code already in use', 400);
      }
    }
    if (name) {
      const existingName = await Department.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingName) {
        return sendError(res, 'Department name already in use', 400);
      }
    }

    const updated = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendError(res, 'Department not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, updated, 'Department updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const assignedCount = await Employee.countDocuments({ department: req.params.id });
    if (assignedCount > 0) {
      return sendError(res, `Cannot delete department with ${assignedCount} assigned employees. Reassign them first.`, 400);
    }

    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Department not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, null, 'Department deleted successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
