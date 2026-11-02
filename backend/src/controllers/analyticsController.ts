import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Payroll } from '../models/Payroll';
import { sendSuccess, sendError } from '../utils/response';
import { cacheService } from '../config/redis';

export const getEmployeeAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:analytics:employees';
    const cached = await cacheService.get(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Employee analytics (cached)');

    const [byDept, byJob, byType, byGender] = await Promise.all([
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
        { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Employee.aggregate([
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      ]),
      Employee.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
    ]);

    const result = {
      byDepartment: byDept.map(d => ({ name: d._id, value: d.count })),
      byJobTitle: byJob.map(j => ({ name: j._id, value: j.count })),
      byEmploymentType: byType.map(t => ({ name: t._id, value: t.count })),
      byGender: byGender.map(g => ({ name: g._id, value: g.count })),
    };

    await cacheService.set(cacheKey, result, 120);
    return sendSuccess(res, result, 'Employee analytics retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getAttendanceAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:analytics:attendance';
    const cached = await cacheService.get(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Attendance analytics (cached)');

    const [statusBreakdown, monthlyTrend] = await Promise.all([
      Attendance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Attendance.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$attendanceDate' } },
            present: {
              $sum: { $cond: [{ $in: ['$status', ['Present', 'Half Day']] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
            },
            leave: {
              $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalDays = statusBreakdown.reduce((acc, curr) => acc + curr.count, 0);
    const presentCount = statusBreakdown.find(s => s._id === 'Present')?.count || 0;
    const avgAttendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 95.0;

    const result = {
      averageAttendanceRate: Number(avgAttendancePercentage),
      statusBreakdown: statusBreakdown.map(s => ({ name: s._id, value: s.count })),
      monthlyTrend: monthlyTrend.map(m => ({
        month: m._id,
        present: m.present,
        absent: m.absent,
        leave: m.leave,
      })),
    };

    await cacheService.set(cacheKey, result, 120);
    return sendSuccess(res, result, 'Attendance analytics retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getLeaveAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:analytics:leaves';
    const cached = await cacheService.get(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Leave analytics (cached)');

    const [byType, byStatus, trend] = await Promise.all([
      Leave.aggregate([
        { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      ]),
      Leave.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Leave.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$appliedDate' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const result = {
      byType: byType.map(t => ({ name: t._id, value: t.count })),
      byStatus: byStatus.map(s => ({ name: s._id, value: s.count })),
      monthlyTrend: trend.map(t => ({ month: t._id, requests: t.count })),
    };

    await cacheService.set(cacheKey, result, 120);
    return sendSuccess(res, result, 'Leave analytics retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getPayrollAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:analytics:payroll';
    const cached = await cacheService.get(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Payroll analytics (cached)');

    const [deptPayroll, overview, trend] = await Promise.all([
      Payroll.aggregate([
        {
          $lookup: {
            from: 'employees',
            localField: 'employee',
            foreignField: '_id',
            as: 'emp',
          },
        },
        { $unwind: '$emp' },
        {
          $lookup: {
            from: 'departments',
            localField: 'emp.department',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        {
          $group: {
            _id: '$dept.name',
            totalSalary: { $sum: '$netSalary' },
            avgSalary: { $avg: '$netSalary' },
          },
        },
      ]),
      Payroll.aggregate([
        {
          $group: {
            _id: null,
            totalPayroll: { $sum: '$netSalary' },
            avgSalary: { $avg: '$netSalary' },
          },
        },
      ]),
      Payroll.aggregate([
        {
          $group: {
            _id: { month: '$month', year: '$year' },
            total: { $sum: '$netSalary' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const result = {
      totalPayroll: overview[0]?.totalPayroll || 0,
      averageSalary: Math.round(overview[0]?.avgSalary || 0),
      byDepartment: deptPayroll.map(d => ({
        department: d._id,
        totalSalary: d.totalSalary,
        avgSalary: Math.round(d.avgSalary),
      })),
      monthlyTrend: trend.map(t => ({
        period: `${t._id.month}/${t._id.year}`,
        total: t.total,
      })),
    };

    await cacheService.set(cacheKey, result, 120);
    return sendSuccess(res, result, 'Payroll analytics retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getHiringAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = 'cache:analytics:hiring';
    const cached = await cacheService.get(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Hiring analytics (cached)');

    const hiring = await Employee.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$joiningDate' } },
          hires: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = {
      trend: hiring.map(h => ({ month: h._id, hires: h.hires })),
    };

    await cacheService.set(cacheKey, result, 120);
    return sendSuccess(res, result, 'Hiring analytics retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
