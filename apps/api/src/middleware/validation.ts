import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { createError } from "./errorHandler";

/**
 * Generic validation middleware using Zod
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(422).json({
          message: "Validation failed",
          errors,
        });
        return;
      }

      throw createError("Validation error", 500);
    }
  };
}
