import { Response } from 'express';
import { Leave } from '../models/Leave';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { cacheService } from '../config/redis';

export const getLeaves = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status, leaveType } = req.query;
    const query: any = {};

    if (req.user?.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return sendSuccess(res, [], 'No leaves found');
      }
      query.employee = req.user.employeeId;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeCode jobTitle department')
      .populate('approvedBy', 'email')
      .sort({ appliedDate: -1 });

    return sendSuccess(res, leaves, 'Leave applications retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const applyLeave = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (req.user?.role === 'EMPLOYEE') {
      employeeId = req.user.employeeId;
    }

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return sendError(res, 'Please provide all required leave fields', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return sendError(res, 'End date cannot be earlier than start date', 400);
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      status: 'Pending',
    });

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, newLeave, 'Leave application submitted successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return sendError(res, 'Invalid status update', 400);
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user?._id,
        approvalDate: new Date(),
      },
      { new: true }
    ).populate('employee', 'firstName lastName');

    if (!leave) {
      return sendError(res, 'Leave request not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, leave, `Leave request ${status.toLowerCase()} successfully`);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const cancelLeave = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 'Leave request not found', 404);
    }

    if (req.user?.role === 'EMPLOYEE' && String(leave.employee) !== String(req.user.employeeId)) {
      return sendError(res, 'Unauthorized to cancel this leave application', 403);
    }

    if (leave.status !== 'Pending') {
      return sendError(res, 'Only pending leave requests can be cancelled', 400);
    }

    leave.status = 'Cancelled';
    await leave.save();

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, leave, 'Leave application cancelled successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
