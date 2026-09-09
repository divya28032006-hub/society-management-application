import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Log error
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  // Handle specific error types
  if (err.name === 'CastError' && (err as any).path === 'society') {
  const message = 'Invalid society ID format';
  error = new AppError(message, 400);
}

  if (err.name === 'ValidationError') {
  const message = Object.values((err as any).errors).map((val: any) => val.message).join('. ');
  error = new AppError(message, 400);
}

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    const message = `Duplicate value for ${field}. Please use a different value.`;
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // Send response
  const appError = error as AppError;
  const statusCode = appError.statusCode || 500;
  const message = appError.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};