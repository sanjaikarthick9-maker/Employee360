import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  employee: Types.ObjectId;
  attendanceDate: Date;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  workingHours: number;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: String,
      default: null,
    },
    checkOut: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave'],
      default: 'Present',
    },
    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
