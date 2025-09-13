import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const loginSchema = Joi.object({
  username: Joi.string().required().min(1).max(50),
  password: Joi.string().required().min(1).max(100),
});

function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(422).json({
        message: "Validation failed",
        errors,
      });
    }

    req[property] = value;
    next();
  };
}

export const validateLogin = validate(loginSchema);
