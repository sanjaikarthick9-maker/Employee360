import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { BarChart3, Users, DollarSign, CalendarCheck, TrendingUp } from 'lucide-react';

const COLORS = ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const AnalyticsPage: React.FC = () => {
  const [empAnalytics, setEmpAnalytics] = useState<any>(null);
  const [attAnalytics, setAttAnalytics] = useState<any>(null);
  const [leaveAnalytics, setLeaveAnalytics] = useState<any>(null);
  const [payrollAnalytics, setPayrollAnalytics] = useState<any>(null);
  const [hiringAnalytics, setHiringAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [emp, att, lve, pay, hire] = await Promise.all([
          api.get('/analytics/employees'),
          api.get('/analytics/attendance'),
          api.get('/analytics/leaves'),
          api.get('/analytics/payroll'),
          api.get('/analytics/hiring'),
        ]);
        setEmpAnalytics(emp.data.data);
        setAttAnalytics(att.data.data);
        setLeaveAnalytics(lve.data.data);
        setPayrollAnalytics(pay.data.data);
        setHiringAnalytics(hire.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 animate-pulse">
        <BarChart3 className="w-8 h-8 text-sky-600 mx-auto mb-2 animate-bounce" />
        Calculating MongoDB aggregation metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Workforce Analytics Hub</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time MongoDB aggregation pipelines & Redis cached intelligence</p>
      </div>

      {/* Row 1: Department Payroll & Attendance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Total Payroll by Department</h3>
              <p className="text-xs text-slate-400">Sum of net monthly payouts across teams</p>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollAnalytics?.byDepartment || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="totalSalary" fill="#10b981" radius={[6, 6, 0, 0]} name="Total Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Overall Attendance Breakdown</h3>
              <p className="text-xs text-slate-400">
                Average Organization Attendance Rate: <strong className="text-sky-600">{attAnalytics?.averageAttendanceRate}%</strong>
              </p>
            </div>
            <CalendarCheck className="w-5 h-5 text-sky-600" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attAnalytics?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {(attAnalytics?.statusBreakdown || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leave Categories & Hiring Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Type Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Leave Types Requested</h3>
              <p className="text-xs text-slate-400">Casual, Sick, Earned, and Unpaid balance</p>
            </div>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveAnalytics?.byType || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Timeline Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Talent Acquisition Growth</h3>
              <p className="text-xs text-slate-400">New employees joined per monthly timeline</p>
            </div>
            <TrendingUp className="w-5 h-5 text-sky-600" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringAnalytics?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="hires" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} name="New Hires" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
