import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Attendance } from '../types';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      setAttendanceList(res.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkToday = async (status: 'Present' | 'Half Day') => {
    setSuccessMsg('');
    setErrorMsg('');
    setMarking(true);
    try {
      await api.post('/attendance', {
        status,
        checkIn: '09:00',
        checkOut: status === 'Present' ? '17:00' : '13:00',
      });
      setSuccessMsg(`Today's attendance registered successfully as ${status}.`);
      fetchAttendance();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Attendance for today is already marked.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Clock-in */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Monitor company-wide employee attendance and daily shifts' : 'Review your daily logs and register shift attendance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={marking}
            onClick={() => handleMarkToday('Present')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Clock In (Full Day)</span>
          </button>
          <button
            disabled={marking}
            onClick={() => handleMarkToday('Half Day')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500 shadow-md shadow-amber-600/20 transition-all disabled:opacity-60"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In (Half Day)</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift In / Out</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Loading attendance logs...</td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">No attendance logs available.</td>
                </tr>
              ) : (
                attendanceList.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : 'Self'}
                      {att.employee?.employeeCode && (
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          {att.employee.employeeCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                      {new Date(att.attendanceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {att.checkIn ? `${att.checkIn} - ${att.checkOut || 'Active'}` : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-700">
                      {att.workingHours} hrs
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          att.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : att.status === 'Half Day'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : att.status === 'Leave'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
