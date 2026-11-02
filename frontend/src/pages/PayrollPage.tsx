import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Payroll, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { CreditCard, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 6000,
    allowances: 800,
    deductions: 400,
    bonus: 0,
    paymentStatus: 'Processed',
  });

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll');
      setPayrolls(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/employees?limit=100');
      setEmployees(res.data.data.employees);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, []);

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/payroll', formData);
      setIsModalOpen(false);
      fetchPayroll();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const totalCalculatedNet =
    Number(formData.basicSalary) +
    Number(formData.allowances) +
    Number(formData.bonus) -
    Number(formData.deductions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payroll Simulation</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Process monthly compensation, salary structures, and payouts' : 'View your monthly payslip history and salary breakdown'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setFormError(''); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Payslip</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Bonus</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading payroll data...</td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No payroll records found.</td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : 'Employee'}
                      {p.employee?.employeeCode && (
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          {p.employee.employeeCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {p.month}/{p.year}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                      $\{p.basicSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-600 font-mono">
                      +$\{p.allowances.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-rose-500 font-mono">
                      -$\{p.deductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-amber-600 font-mono">
                      +$\{p.bonus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-900 font-mono">
                      $\{p.netSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          p.paymentStatus === 'Processed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.paymentStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Monthly Compensation Slip"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreatePayroll} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Employee</label>
            <select
              required
              value={formData.employee}
              onChange={(e) => {
                const emp = employees.find(x => x._id === e.target.value);
                const basic = emp ? Math.round(emp.salary / 12) : 6000;
                setFormData({
                  ...formData,
                  employee: e.target.value,
                  basicSalary: basic,
                  allowances: Math.round(basic * 0.15),
                  deductions: Math.round(basic * 0.08),
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Choose Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Basic Salary ($)</label>
              <input
                type="number"
                required
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Allowances ($)</label>
              <input
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deductions ($)</label>
              <input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bonus ($)</label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Real-time Computed Net Salary */}
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-sm">
            <span className="font-semibold text-sky-900">Computed Net Salary:</span>
            <span className="font-extrabold text-sky-700 text-lg font-mono">
              $\{totalCalculatedNet.toLocaleString()}
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-500 shadow-md shadow-sky-600/20"
            >
              Record Payslip
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
