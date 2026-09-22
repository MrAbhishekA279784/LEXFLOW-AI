import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string;
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred. Please try again.';

  logger.error(`API Error on ${req.method} ${req.path}`, err, {
    requestId,
    statusCode,
    errorCode,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(env.NODE_ENV === 'development' && !isAppError ? { debugStack: err.stack } : {}),
      ...(isAppError && (err as AppError).details ? { details: (err as AppError).details } : {}),
    }
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND_ERROR',
      message: `The requested route ${req.method} ${req.path} was not found on LEXFLOW API.`
    }
  });
}
