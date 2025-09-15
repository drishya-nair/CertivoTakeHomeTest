import { z } from "zod";

/**
 * Frontend validation schemas using Zod
 * 
 * These schemas match the backend validation to ensure consistency
 * across the entire application.
 */

/**
 * Login form validation schema
 * Matches the backend login validation exactly
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be 50 characters or less"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password must be 100 characters or less"),
});

/**
 * Type inference from login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Simple validation error logging helper
 * Logs validation errors to console for debugging
 */
export const logValidationError = (field: string, message: string, value?: any): void => {
  console.warn(`[Validation Error] ${field}: ${message}`, value ? { value } : '');
};
