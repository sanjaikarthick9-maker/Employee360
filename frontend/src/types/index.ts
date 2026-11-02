export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employee?: Employee;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  manager?: Employee;
  employeeCount?: number;
  createdAt: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  department: Department | string;
  jobTitle: string;
  employmentType: 'Full Time' | 'Part Time' | 'Contract' | 'Intern';
  joiningDate: string;
  salary: number;
  manager?: Employee;
  status: 'Active' | 'Inactive' | 'On Leave';
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: string;
}

export interface Attendance {
  _id: string;
  employee: Employee;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  workingHours: number;
}

export interface LeaveRequest {
  _id: string;
  employee: Employee;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: string;
  approvalDate?: string;
}

export interface Payroll {
  _id: string;
  employee: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  paymentStatus: 'Pending' | 'Processed' | 'Failed';
  paymentDate?: string;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    totalDepartments: number;
    presentToday: number;
    absentToday: number;
    pendingLeaves: number;
    totalMonthlyPayroll: number;
  };
  charts: {
    employeesByDepartment: { name: string; count: number }[];
    employmentTypes: { name: string; count: number }[];
  };
}
