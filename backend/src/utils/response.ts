import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  error: string = 'SERVER_ERROR'
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
