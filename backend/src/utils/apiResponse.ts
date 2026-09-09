import { Response } from 'express';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    status: 'success',
    message,
    data
  };
  return res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
    totalPages?: number;
  },
  message: string = 'Success'
): Response => {
  const pagesCount = pagination.pages ?? pagination.totalPages ?? Math.ceil(pagination.total / (pagination.limit || 1));
  const response: ApiResponse<T> = {
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagesCount,
      totalPages: pagesCount
    }
  };
  return res.status(200).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): Response => {
  const response: ApiResponse = {
    status: 'error',
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (
  res: Response,
  message: string = 'Resource deleted successfully'
): Response => {
  return res.status(204).json({
    status: 'success',
    message
  });
};