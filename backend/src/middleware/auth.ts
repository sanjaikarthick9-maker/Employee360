import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models/User';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return sendError(res, 'Authentication token required', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return sendError(res, 'User session expired or invalid', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 403, 'FORBIDDEN');
  }
};

export const requireRole = (...roles: Array<'ADMIN' | 'EMPLOYEE'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Insufficient permissions.', 403, 'ACCESS_DENIED');
    }
    next();
  };
};
