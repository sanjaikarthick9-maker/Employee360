import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Department } from '../models/Department';
import { sendSuccess, sendError } from '../utils/response';
import { cacheService } from '../config/redis';

export const getEmployees = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      search,
      department,
      status,
      employmentType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeCode: searchRegex },
        { jobTitle: searchRegex },
      ];
    }

    if (department) query.department = department;
    if (status) query.status = status;
    if (employmentType) query.employmentType = employmentType;

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;
    const sort: any = { [String(sortBy)]: sortOrder === 'asc' ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name code')
        .populate('manager', 'firstName lastName employeeCode')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    return sendSuccess(res, {
      employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    }, 'Employees retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<any> => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('manager', 'firstName lastName email employeeCode');

    if (!employee) {
      return sendError(res, 'Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
    }

    return sendSuccess(res, employee, 'Employee retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      department,
      jobTitle,
      salary,
    } = req.body;

    if (!employeeCode || !firstName || !lastName || !email || !phone || !department || !jobTitle || salary === undefined) {
      return sendError(res, 'Please provide all mandatory employee fields', 400, 'VALIDATION_ERROR');
    }

    if (salary < 0) {
      return sendError(res, 'Salary cannot be negative', 400, 'VALIDATION_ERROR');
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return sendError(res, 'Department not found', 400, 'INVALID_DEPARTMENT');
    }

    const existingCode = await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() });
    if (existingCode) {
      return sendError(res, 'Employee Code already exists', 400, 'DUPLICATE_CODE');
    }

    const existingEmail = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return sendError(res, 'Employee Email already exists', 400, 'DUPLICATE_EMAIL');
    }

    const newEmployee = await Employee.create({
      ...req.body,
      employeeCode: employeeCode.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
    });

    // Invalidate caches
    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, newEmployee, 'Employee created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const { salary, employeeCode, email } = req.body;

    if (salary !== undefined && salary < 0) {
      return sendError(res, 'Salary cannot be negative', 400, 'VALIDATION_ERROR');
    }

    if (employeeCode) {
      const existing = await Employee.findOne({
        employeeCode: employeeCode.toUpperCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return sendError(res, 'Employee Code already in use by another employee', 400);
      }
    }

    if (email) {
      const existingEmail = await Employee.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return sendError(res, 'Email already in use by another employee', 400);
      }
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department');

    if (!updated) {
      return sendError(res, 'Employee not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, updated, 'Employee updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Employee not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, null, 'Employee deleted successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
