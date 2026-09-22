import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten ? err.flatten() : issues));
      }
      next(err);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten ? err.flatten() : issues));
      }
      next(err);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(message, err.flatten ? err.flatten() : issues));
      }
      next(err);
    }
  };
}
