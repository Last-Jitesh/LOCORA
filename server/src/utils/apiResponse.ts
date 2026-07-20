import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendSuccess = <T>(res: Response, data: T, message = 'Success', statusCode = 200, pagination?: ApiResponse['pagination']): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode = 500): void => {
  res.status(statusCode).json({ success: false, message });
};
