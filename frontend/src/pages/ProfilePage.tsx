import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Briefcase, Building, Phone, Calendar, UserCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const emp = user?.employee;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-sky-600/20">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {emp ? `${emp.firstName} ${emp.lastName}` : user?.email}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                {user?.role}
              </span>
              {emp?.employeeCode && (
                <span className="font-mono text-xs text-slate-400 font-medium">
                  {emp.employeeCode}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Email: <strong className="text-slate-800">{user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Access Level: <strong className="text-slate-800">{user?.role}</strong></span>
              </div>
            </div>
          </div>

          {emp && (
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Assigned Job</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <span>Title: <strong className="text-slate-800">{emp.jobTitle}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>Phone: <strong className="text-slate-800">{emp.phone}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
