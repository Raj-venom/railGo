import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'params' | 'query';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (schemas: ValidateSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {};

    const targets: ValidateTarget[] = ['body', 'params', 'query'];

    for (const target of targets) {
      const schema = schemas[target];
      if (!schema) continue;

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        errors[target] = result.error.issues.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
      } else {
        req[target] = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};