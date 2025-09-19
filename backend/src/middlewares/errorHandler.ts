import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

interface AppError extends Error {
  status?: number;
  details?: unknown;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  const payload: Record<string, unknown> = {
    message: err.message || 'Internal server error',
  };

  if (err instanceof ZodError) {
    payload.message = 'Validation error';
    payload.issues = err.flatten();
  } else if (err.details) {
    payload.details = err.details;
  }

  if (status >= 500) {
    logger.error(err.message, err.stack);
  }

  res.status(status).json(payload);
}
