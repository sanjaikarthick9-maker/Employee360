import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Department } from '../models/Department';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Payroll } from '../models/Payroll';
import { sendSuccess, sendError } from '../utils/response';
import { cacheService } from '../config/redis';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:dashboard:stats';
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return sendSuccess(res, cached, 'Dashboard stats (cached)');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      totalDepartments,
      presentToday,
      absentToday,
      pendingLeaves,
      payrollAgg,
      empByDept,
      empByType,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: 'On Leave' }),
      Department.countDocuments(),
      Attendance.countDocuments({
        attendanceDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['Present', 'Half Day'] },
      }),
      Attendance.countDocuments({
        attendanceDate: { $gte: todayStart, $lte: todayEnd },
        status: 'Absent',
      }),
      Leave.countDocuments({ status: 'Pending' }),
      Payroll.aggregate([
        { $match: { paymentStatus: 'Processed' } },
        { $group: { _id: null, totalPayout: { $sum: '$netSalary' } } },
      ]),
      Employee.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        { $group: { _id: '$dept.name', count: { $sum: 1 } } },
      ]),
      Employee.aggregate([
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      ]),
    ]);

    const totalMonthlyPayroll = payrollAgg.length > 0 ? payrollAgg[0].totalPayout : 0;

    const data = {
      kpis: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        totalDepartments,
        presentToday,
        absentToday,
        pendingLeaves,
        totalMonthlyPayroll,
      },
      charts: {
        employeesByDepartment: empByDept.map(d => ({ name: d._id, count: d.count })),
        employmentTypes: empByType.map(t => ({ name: t._id, count: t.count })),
      },
    };

    await cacheService.set(cacheKey, data, 60);

    return sendSuccess(res, data, 'Dashboard stats retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
