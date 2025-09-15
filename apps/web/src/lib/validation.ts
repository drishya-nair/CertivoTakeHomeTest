import { z } from "zod";

// Validation schema for login form
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

// Type inference from schema
export type LoginFormData = z.infer<typeof loginSchema>;

// Log validation errors for debugging
export const logValidationError = (field: string, message: string, value?: unknown): void => {
  console.warn(`[Validation Error] ${field}: ${message}`, value ? { value } : '');
};
