import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Employee } from '../models/Employee';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Payroll } from '../models/Payroll';

export const seedDatabase = async (shouldExit: boolean = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to database for seeding...');
      await mongoose.connect(config.mongoUri);
    }
    console.log('Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Payroll.deleteMany({}),
    ]);

    console.log('Creating Departments...');
    const departments = await Department.create([
      { name: 'Human Resources', code: 'HR', description: 'People operations, recruitment, and talent management' },
      { name: 'Information Technology', code: 'IT', description: 'Software engineering, cloud infrastructure, and IT support' },
      { name: 'Finance', code: 'FIN', description: 'Financial planning, accounting, and payroll management' },
      { name: 'Marketing', code: 'MKT', description: 'Brand strategy, social media, and digital outreach' },
      { name: 'Sales', code: 'SLS', description: 'Business development and client partnerships' },
      { name: 'Operations', code: 'OPS', description: 'Daily logistics, workplace management, and compliance' },
    ]);

    const deptMap: Record<string, any> = {};
    departments.forEach(d => { deptMap[d.code] = d._id; });

    console.log('Creating 20 Realistic Employees...');
    const employeeData = [
      { code: 'EMP-1001', first: 'Alexander', last: 'Wright', email: 'admin@employee360.com', phone: '+1-555-0101', gender: 'Male', dept: deptMap.HR, title: 'HR Director', type: 'Full Time', salary: 95000, date: '2024-01-15' },
      { code: 'EMP-1002', first: 'Sarah', last: 'Connor', email: 'employee@employee360.com', phone: '+1-555-0102', gender: 'Female', dept: deptMap.IT, title: 'Senior Full Stack Engineer', type: 'Full Time', salary: 110000, date: '2024-02-01' },
      { code: 'EMP-1003', first: 'Michael', last: 'Scott', email: 'michael.scott@employee360.com', phone: '+1-555-0103', gender: 'Male', dept: deptMap.SLS, title: 'Regional Sales Manager', type: 'Full Time', salary: 85000, date: '2024-02-15' },
      { code: 'EMP-1004', first: 'Elena', last: 'Rostova', email: 'elena.rostova@employee360.com', phone: '+1-555-0104', gender: 'Female', dept: deptMap.FIN, title: 'Lead Financial Analyst', type: 'Full Time', salary: 92000, date: '2024-03-10' },
      { code: 'EMP-1005', first: 'David', last: 'Kim', email: 'david.kim@employee360.com', phone: '+1-555-0105', gender: 'Male', dept: deptMap.IT, title: 'DevOps & Cloud Architect', type: 'Full Time', salary: 115000, date: '2024-04-05' },
      { code: 'EMP-1006', first: 'Priya', last: 'Sharma', email: 'priya.sharma@employee360.com', phone: '+1-555-0106', gender: 'Female', dept: deptMap.MKT, title: 'Head of Growth & Marketing', type: 'Full Time', salary: 88000, date: '2024-05-01' },
      { code: 'EMP-1007', first: 'James', last: 'Wilson', email: 'james.wilson@employee360.com', phone: '+1-555-0107', gender: 'Male', dept: deptMap.OPS, title: 'Operations Lead', type: 'Full Time', salary: 78000, date: '2024-06-15' },
      { code: 'EMP-1008', first: 'Emily', last: 'Watson', email: 'emily.watson@employee360.com', phone: '+1-555-0108', gender: 'Female', dept: deptMap.IT, title: 'Frontend React Developer', type: 'Full Time', salary: 82000, date: '2024-07-20' },
      { code: 'EMP-1009', first: 'Carlos', last: 'Mendez', email: 'carlos.mendez@employee360.com', phone: '+1-555-0109', gender: 'Male', dept: deptMap.SLS, title: 'Account Executive', type: 'Full Time', salary: 72000, date: '2024-08-11' },
      { code: 'EMP-1010', first: 'Jessica', last: 'Taylor', email: 'jessica.taylor@employee360.com', phone: '+1-555-0110', gender: 'Female', dept: deptMap.HR, title: 'Talent Acquisition Specialist', type: 'Full Time', salary: 65000, date: '2024-09-01' },
      { code: 'EMP-1011', first: 'Daniel', last: 'Lee', email: 'daniel.lee@employee360.com', phone: '+1-555-0111', gender: 'Male', dept: deptMap.IT, title: 'Backend Node.js Engineer', type: 'Full Time', salary: 86000, date: '2024-10-15' },
      { code: 'EMP-1012', first: 'Rachel', last: 'Green', email: 'rachel.green@employee360.com', phone: '+1-555-0112', gender: 'Female', dept: deptMap.MKT, title: 'Content & Social Strategist', type: 'Part Time', salary: 45000, date: '2024-11-01' },
      { code: 'EMP-1013', first: 'Robert', last: 'Chen', email: 'robert.chen@employee360.com', phone: '+1-555-0113', gender: 'Male', dept: deptMap.FIN, title: 'Senior Auditor', type: 'Full Time', salary: 84000, date: '2024-12-05' },
      { code: 'EMP-1014', first: 'Amina', last: 'Bello', email: 'amina.bello@employee360.com', phone: '+1-555-0114', gender: 'Female', dept: deptMap.OPS, title: 'Facilities & Logistics Officer', type: 'Full Time', salary: 62000, date: '2025-01-10' },
      { code: 'EMP-1015', first: 'Lucas', last: 'Silva', email: 'lucas.silva@employee360.com', phone: '+1-555-0115', gender: 'Male', dept: deptMap.IT, title: 'QA Automation Engineer', type: 'Contract', salary: 75000, date: '2025-02-01' },
      { code: 'EMP-1016', first: 'Hannah', last: 'Schmidt', email: 'hannah.schmidt@employee360.com', phone: '+1-555-0116', gender: 'Female', dept: deptMap.MKT, title: 'Graphic & UI Designer', type: 'Full Time', salary: 70000, date: '2025-03-15' },
      { code: 'EMP-1017', first: 'Kevin', last: 'Patel', email: 'kevin.patel@employee360.com', phone: '+1-555-0117', gender: 'Male', dept: deptMap.SLS, title: 'Sales Development Rep', type: 'Full Time', salary: 58000, date: '2025-04-20' },
      { code: 'EMP-1018', first: 'Olivia', last: 'Brown', email: 'olivia.brown@employee360.com', phone: '+1-555-0118', gender: 'Female', dept: deptMap.HR, title: 'HR Generalist', type: 'Full Time', salary: 60000, date: '2025-05-12' },
      { code: 'EMP-1019', first: 'Liam', last: 'Murphy', email: 'liam.murphy@employee360.com', phone: '+1-555-0119', gender: 'Male', dept: deptMap.IT, title: 'Software Engineering Intern', type: 'Intern', salary: 35000, date: '2025-06-01' },
      { code: 'EMP-1020', first: 'Sophia', last: 'Martinez', email: 'sophia.martinez@employee360.com', phone: '+1-555-0120', gender: 'Female', dept: deptMap.FIN, title: 'Junior Accountant', type: 'Full Time', salary: 55000, date: '2025-07-01' },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const created = await Employee.create({
        employeeCode: emp.code,
        firstName: emp.first,
        lastName: emp.last,
        email: emp.email,
        phone: emp.phone,
        dateOfBirth: new Date('1992-05-15'),
        gender: emp.gender as any,
        department: emp.dept,
        jobTitle: emp.title,
        employmentType: emp.type as any,
        joiningDate: new Date(emp.date),
        salary: emp.salary,
        status: 'Active',
        profileImage: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        address: {
          street: '100 Innovation Way',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
        }
      });
      employees.push(created);
    }

    console.log('Creating Admin & Employee Users...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const employeePasswordHash = await bcrypt.hash('Employee@123', 10);

    await User.create([
      {
        email: 'admin@employee360.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        employeeId: employees[0]._id,
      },
      {
        email: 'employee@employee360.com',
        passwordHash: employeePasswordHash,
        role: 'EMPLOYEE',
        employeeId: employees[1]._id,
      },
    ]);

    console.log('Generating 70+ Attendance Records across past 14 days...');
    const statuses = ['Present', 'Present', 'Present', 'Present', 'Half Day', 'Leave', 'Absent'];
    const attendanceRecords = [];

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const attDate = new Date();
      attDate.setDate(attDate.getDate() - dayOffset);
      attDate.setHours(0, 0, 0, 0);

      // Skip Sundays
      if (attDate.getDay() === 0) continue;

      for (let i = 0; i < employees.length; i++) {
        // Vary statuses realistically
        const statusIdx = (i + dayOffset) % statuses.length;
        const status = statuses[statusIdx];
        let hours = 8;
        let checkIn = '09:00';
        let checkOut = '17:00';

        if (status === 'Half Day') {
          hours = 4;
          checkOut = '13:00';
        } else if (status === 'Absent' || status === 'Leave') {
          hours = 0;
          checkIn = '';
          checkOut = '';
        }

        attendanceRecords.push({
          employee: employees[i]._id,
          attendanceDate: attDate,
          checkIn,
          checkOut,
          status,
          workingHours: hours,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);

    console.log('Creating 15 Realistic Leave Records...');
    await Leave.create([
      { employee: employees[1]._id, leaveType: 'Casual Leave', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-02'), numberOfDays: 2, reason: 'Family engagement', status: 'Approved', approvedBy: null, approvalDate: new Date('2026-02-28') },
      { employee: employees[1]._id, leaveType: 'Sick Leave', startDate: new Date('2026-04-10'), endDate: new Date('2026-04-11'), numberOfDays: 2, reason: 'Mild flu recovery', status: 'Approved', approvedBy: null, approvalDate: new Date('2026-04-09') },
      { employee: employees[1]._id, leaveType: 'Earned Leave', startDate: new Date('2026-10-05'), endDate: new Date('2026-10-09'), numberOfDays: 5, reason: 'Vacation travel', status: 'Pending' },
      { employee: employees[2]._id, leaveType: 'Casual Leave', startDate: new Date('2026-09-20'), endDate: new Date('2026-09-22'), numberOfDays: 3, reason: 'Personal errands', status: 'Approved' },
      { employee: employees[3]._id, leaveType: 'Sick Leave', startDate: new Date('2026-09-25'), endDate: new Date('2026-09-26'), numberOfDays: 2, reason: 'Medical appointment', status: 'Pending' },
      { employee: employees[4]._id, leaveType: 'Earned Leave', startDate: new Date('2026-08-10'), endDate: new Date('2026-08-15'), numberOfDays: 6, reason: 'Annual holiday trip', status: 'Approved' },
      { employee: employees[5]._id, leaveType: 'Unpaid Leave', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-05'), numberOfDays: 5, reason: 'Higher education workshop', status: 'Approved' },
      { employee: employees[6]._id, leaveType: 'Casual Leave', startDate: new Date('2026-09-15'), endDate: new Date('2026-09-16'), numberOfDays: 2, reason: 'Home renovation', status: 'Rejected' },
      { employee: employees[7]._id, leaveType: 'Casual Leave', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-02'), numberOfDays: 2, reason: 'Attending friend wedding', status: 'Pending' },
      { employee: employees[8]._id, leaveType: 'Sick Leave', startDate: new Date('2026-08-18'), endDate: new Date('2026-08-19'), numberOfDays: 2, reason: 'Dental surgery', status: 'Approved' },
      { employee: employees[9]._id, leaveType: 'Earned Leave', startDate: new Date('2026-06-12'), endDate: new Date('2026-06-16'), numberOfDays: 5, reason: 'Summer trip', status: 'Approved' },
      { employee: employees[10]._id, leaveType: 'Casual Leave', startDate: new Date('2026-09-28'), endDate: new Date('2026-09-29'), numberOfDays: 2, reason: 'Child school meeting', status: 'Pending' },
    ]);

    console.log('Generating 30+ Payroll Records...');
    const payrollRecords = [];
    const months = [7, 8, 9]; // Recent months

    for (const m of months) {
      for (const emp of employees) {
        const basic = Math.round(emp.salary / 12);
        const allowances = Math.round(basic * 0.15);
        const deductions = Math.round(basic * 0.08);
        const bonus = (m === 9 && emp.employeeCode === 'EMP-1002') ? 1000 : 0;
        const net = basic + allowances + bonus - deductions;

        payrollRecords.push({
          employee: emp._id,
          month: m,
          year: 2026,
          basicSalary: basic,
          allowances,
          deductions,
          bonus,
          netSalary: net,
          paymentStatus: 'Processed',
          paymentDate: new Date(2026, m - 1, 28),
        });
      }
    }

    await Payroll.insertMany(payrollRecords);

    console.log('🎉 Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('ADMIN:    admin@employee360.com    / Admin@123');
    console.log('EMPLOYEE: employee@employee360.com / Employee@123');
    console.log('----------------------------------------------------');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
    if (shouldExit) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase(true);
}
