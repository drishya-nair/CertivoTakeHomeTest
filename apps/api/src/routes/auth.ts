import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";

import { login, logout } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";

const router = Router();

// Validation constants
/** Maximum allowed length for username input */
const USERNAME_MAX_LENGTH = 50;
/** Maximum allowed length for password input */
const PASSWORD_MAX_LENGTH = 100;

/**
 * Joi validation schema for login requests
 * 
 * Enforces username and password length limits and ensures
 * both fields are required and non-empty strings
 */
const loginSchema = Joi.object({
  username: Joi.string().required().min(1).max(USERNAME_MAX_LENGTH),
  password: Joi.string().required().min(1).max(PASSWORD_MAX_LENGTH),
});

/**
 * Validates login request data using Joi schema
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 */
const validateLogin = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { error, value } = loginSchema.validate(req.body, {
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

  req.body = value;
  next();
};

router.post("/login", validateLogin, login);
router.post("/logout", authenticate, logout);

export default router;
