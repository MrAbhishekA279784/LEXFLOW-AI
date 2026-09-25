import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues: ZodIssue[] = err.issues || [];
        const message = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten()));
      }
      next(err);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues: ZodIssue[] = err.issues || [];
        const message = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten()));
      }
      next(err);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      Object.assign(req.params, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues: ZodIssue[] = err.issues || [];
        const message = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten()));
      }
      next(err);
    }
  };
}

