import { Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Employee } from '../models/Employee';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { cacheService } from '../config/redis';

export const getAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { employeeId, departmentId, date, month, year } = req.query;
    const query: any = {};

    // If role is EMPLOYEE, restrict strictly to own employeeId
    if (req.user?.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return sendSuccess(res, [], 'No attendance found');
      }
      query.employee = req.user.employeeId;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (departmentId) {
      const deptEmployees = await Employee.find({ department: departmentId }).select('_id');
      query.employee = { $in: deptEmployees.map(e => e._id) };
    }

    if (date) {
      const start = new Date(String(date));
      start.setHours(0, 0, 0, 0);
      const end = new Date(String(date));
      end.setHours(23, 59, 59, 999);
      query.attendanceDate = { $gte: start, $lte: end };
    } else if (month && year) {
      const start = new Date(parseInt(String(year)), parseInt(String(month)) - 1, 1);
      const end = new Date(parseInt(String(year)), parseInt(String(month)), 0, 23, 59, 59, 999);
      query.attendanceDate = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeCode jobTitle department')
      .sort({ attendanceDate: -1 })
      .limit(200);

    return sendSuccess(res, records, 'Attendance records retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let { employeeId, date, checkIn, checkOut, status } = req.body;

    // Default to authenticated employee if not admin or missing
    if (req.user?.role === 'EMPLOYEE') {
      employeeId = req.user.employeeId;
    }

    if (!employeeId) {
      return sendError(res, 'Employee ID is required', 400);
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Prevent duplicate attendance
    const existing = await Attendance.findOne({
      employee: employeeId,
      attendanceDate: targetDate,
    });

    if (existing) {
      return sendError(res, 'Attendance record already exists for this employee on this date', 400, 'DUPLICATE_ATTENDANCE');
    }

    let workingHours = 0;
    if (checkIn && checkOut) {
      const [h1, m1] = checkIn.split(':').map(Number);
      const [h2, m2] = checkOut.split(':').map(Number);
      workingHours = Math.max(0, parseFloat(((h2 * 60 + m2 - (h1 * 60 + m1)) / 60).toFixed(2)));
    } else if (status === 'Present') {
      workingHours = 8;
    } else if (status === 'Half Day') {
      workingHours = 4;
    }

    const record = await Attendance.create({
      employee: employeeId,
      attendanceDate: targetDate,
      checkIn: checkIn || '09:00',
      checkOut: checkOut || '17:00',
      status: status || 'Present',
      workingHours,
    });

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, record, 'Attendance marked successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { checkIn, checkOut, status } = req.body;
    let workingHours = req.body.workingHours;

    if (checkIn && checkOut) {
      const [h1, m1] = checkIn.split(':').map(Number);
      const [h2, m2] = checkOut.split(':').map(Number);
      workingHours = Math.max(0, parseFloat(((h2 * 60 + m2 - (h1 * 60 + m1)) / 60).toFixed(2)));
    }

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, workingHours },
      { new: true }
    ).populate('employee', 'firstName lastName employeeCode');

    if (!updated) {
      return sendError(res, 'Attendance record not found', 404);
    }

    await cacheService.invalidateByPattern('cache:*');

    return sendSuccess(res, updated, 'Attendance updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const deleteAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, 'Attendance record not found', 404);
    }
    await cacheService.invalidateByPattern('cache:*');
    return sendSuccess(res, null, 'Attendance record deleted');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
