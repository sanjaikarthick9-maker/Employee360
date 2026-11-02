import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { DashboardStats } from '../types';
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  CalendarCheck,
  CalendarClock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
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
  Legend,
} from 'recharts';

const COLORS = ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl" />
          <div className="h-80 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl text-rose-700">
        <h3 className="font-bold text-lg mb-1">Unable to load dashboard</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = stats?.kpis;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-semibold tracking-wider uppercase border border-sky-400/30">
            Workforce Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-3">
            Centralized Organization Overview
          </h1>
          <p className="mt-2 text-sm text-sky-100/80 leading-relaxed">
            Monitor real-time headcounts, today's attendance status, pending approvals, and department distributions in one synchronized dashboard.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workforce"
          value={kpis?.totalEmployees || 0}
          icon={Users}
          color="bg-sky-50 text-sky-600 border-sky-100"
          subtitle="Registered staff"
          trend="Organization strength"
        />
        <StatCard
          title="Active Employees"
          value={kpis?.activeEmployees || 0}
          icon={UserCheck}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
          subtitle="Currently active"
          trend="Healthy status"
        />
        <StatCard
          title="Present Today"
          value={kpis?.presentToday || 0}
          icon={CalendarCheck}
          color="bg-teal-50 text-teal-600 border-teal-100"
          subtitle="Checked in"
          trend="Live attendance"
        />
        <StatCard
          title="Absent Today"
          value={kpis?.absentToday || 0}
          icon={UserX}
          color="bg-rose-50 text-rose-600 border-rose-100"
          subtitle="Unmarked / Absent"
        />
        <StatCard
          title="On Leave"
          value={kpis?.onLeaveEmployees || 0}
          icon={CalendarClock}
          color="bg-amber-50 text-amber-600 border-amber-100"
          subtitle="Approved leaves"
        />
        <StatCard
          title="Total Departments"
          value={kpis?.totalDepartments || 0}
          icon={Building2}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          subtitle="Operating teams"
        />
        <StatCard
          title="Pending Leaves"
          value={kpis?.pendingLeaves || 0}
          icon={CalendarClock}
          color="bg-orange-50 text-orange-600 border-orange-100"
          subtitle="Awaiting decision"
        />
        <StatCard
          title="Monthly Payroll"
          value={`$${(kpis?.totalMonthlyPayroll || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-violet-50 text-violet-600 border-violet-100"
          subtitle="Processed volume"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Employees by Department</h3>
              <p className="text-xs text-slate-400">Headcount distribution across divisions</p>
            </div>
            <TrendingUp className="w-5 h-5 text-sky-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.employeesByDepartment || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Type Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Employment Type Breakdown</h3>
              <p className="text-xs text-slate-400">Full Time, Part Time, Contract, Intern</p>
            </div>
            <Users className="w-5 h-5 text-cyan-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts?.employmentTypes || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {(stats?.charts?.employmentTypes || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
