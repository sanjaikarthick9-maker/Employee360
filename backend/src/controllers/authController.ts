import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { config } from '../config';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 'Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    let employeeProfile = null;
    if (user.employeeId) {
      employeeProfile = await Employee.findById(user.employeeId).populate('department');
    }

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: employeeProfile,
      },
    }, 'Login successful');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return sendError(res, 'User session not found', 404);
    }
    let employee = null;
    if (req.user.employeeId) {
      employee = await Employee.findById(req.user.employeeId).populate('department');
    }
    return sendSuccess(res, {
      user: req.user,
      employee,
    }, 'Current user fetched');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
