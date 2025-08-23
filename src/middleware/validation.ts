import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { createError } from '../middleware/errorHandler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = result.body || req.body;
      req.query = result.query || req.query;
      req.params = result.params || req.params;
      
      next();
    } catch (error: any) {
      const errorMessage = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation error';
      next(createError(errorMessage, 400));
    }
  };
};
