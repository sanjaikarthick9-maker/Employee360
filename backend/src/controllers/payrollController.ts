import { Response } from 'express';
import { Payroll } from '../models/Payroll';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { cacheService } from '../config/redis';

export const getPayroll = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { month, year, paymentStatus, employeeId } = req.query;
    const query: any = {};

    if (req.user?.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return sendSuccess(res, [], 'No payroll found');
      }
      query.employee = req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month) query.month = parseInt(String(month), 10);
    if (year) query.year = parseInt(String(year), 10);
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const payrolls = await Payroll.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeCode jobTitle department salary',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ year: -1, month: -1 });

    return sendSuccess(res, payrolls, 'Payroll records retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const createPayroll = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { employee, month, year, basicSalary, allowances = 0, deductions = 0, bonus = 0, paymentStatus } = req.body;

    if (!employee || !month || !year || basicSalary === undefined) {
      return sendError(res, 'Employee, month, year and basic salary are required', 400);
    }

    const netSalary = Number(basicSalary) + Number(allowances) + Number(bonus) - Number(deductions);

    const existing = await Payroll.findOne({ employee, month, year });
    if (existing) {
      return sendError(res, 'Payroll entry already exists for this employee for this month/year', 400);
    }

    const record = await Payroll.create({
      employee,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      bonus,
      netSalary,
      paymentStatus: paymentStatus || 'Pending',
      paymentDate: paymentStatus === 'Processed' ? new Date() : null,
    });

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, record, 'Payroll generated successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updatePayroll = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { basicSalary, allowances, deductions, bonus, paymentStatus } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return sendError(res, 'Payroll record not found', 404);
    }

    const b = basicSalary !== undefined ? Number(basicSalary) : payroll.basicSalary;
    const a = allowances !== undefined ? Number(allowances) : payroll.allowances;
    const d = deductions !== undefined ? Number(deductions) : payroll.deductions;
    const bon = bonus !== undefined ? Number(bonus) : payroll.bonus;

    const netSalary = b + a + bon - d;

    const updated = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        netSalary,
        paymentDate: paymentStatus === 'Processed' ? new Date() : payroll.paymentDate,
      },
      { new: true }
    ).populate('employee', 'firstName lastName');

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, updated, 'Payroll updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const deletePayroll = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const deleted = await Payroll.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Payroll record not found', 404);
    }
    await cacheService.invalidateByPattern('cache:*');
    return sendSuccess(res, null, 'Payroll record deleted');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
