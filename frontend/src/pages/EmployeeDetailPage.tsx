import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Employee } from '../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading full employee profile...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-rose-500">Employee record not found.</div>;
  }

  const deptName = typeof employee.department === 'object' ? employee.department?.name : 'General';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-sky-600 to-indigo-700 p-6 flex items-end">
          <div className="translate-y-12 flex items-end gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
            </div>
            <div className="pb-1 text-slate-900">
              <h1 className="text-2xl font-bold text-white tracking-tight">{employee.firstName} {employee.lastName}</h1>
              <p className="text-xs text-sky-200 font-medium font-mono">{employee.employeeCode}</p>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8 space-y-8">
          {/* Quick Badges */}
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {employee.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {employee.employmentType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {deptName}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Employment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <span>Job Title: <strong className="text-slate-800">{employee.jobTitle}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Building className="w-4 h-4 text-sky-600" />
                  <span>Department: <strong className="text-slate-800">{deptName}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Joining Date: <strong className="text-slate-800">{new Date(employee.joiningDate).toLocaleDateString()}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <DollarSign className="w-4 h-4 text-sky-600" />
                  <span>Annual Base: <strong className="text-slate-800">$\{employee.salary.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Contact & Personal</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Email: <strong className="text-slate-800">{employee.email}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>Phone: <strong className="text-slate-800">{employee.phone}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>Gender: <strong className="text-slate-800">{employee.gender}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
