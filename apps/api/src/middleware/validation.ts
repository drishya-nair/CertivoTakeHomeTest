import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// Validation schemas
const bomPartSchema = Joi.object({
  part_number: Joi.string().required().min(1).max(50),
  material: Joi.string().required().min(1).max(100),
  weight_g: Joi.number().required().min(0).max(1000000),
});

const bomDataSchema = Joi.object({
  bom_id: Joi.string().required().min(1).max(50),
  product_name: Joi.string().required().min(1).max(200),
  parts: Joi.array().items(bomPartSchema).required().min(1).max(1000),
});

const loginSchema = Joi.object({
  username: Joi.string().required().min(1).max(50),
  password: Joi.string().required().min(1).max(100),
});

// Validation middleware factory
function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }
    
    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
}

// Export validation middleware
export const validateBomData = validate(bomDataSchema);
export const validateLogin = validate(loginSchema);
