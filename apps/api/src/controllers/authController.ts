import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import env from "@/config/env";
import { createError } from "@/middleware/errorHandler";
import logger from "@/lib/logger";

// Constants for security
const TOKEN_EXPIRY = "2h";
const JWT_ALGORITHM = "HS256" as const;

// Type definitions
/**
 * Request payload for user login (validated by Zod middleware)
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Response payload for successful login
 */
interface LoginResponse {
  token: string;
}

/**
 * JWT token payload structure
 */
interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

/**
 * Performs constant-time comparison using SHA-256 hashes
 * Prevents timing attacks by ensuring comparison time is independent of input
 * 
 * @param username - Username to verify
 * @param password - Password to verify
 * @returns True if credentials match, false otherwise
 */
function verifyCredentials(username: string, password: string): boolean {
  const hash = (value: string) => crypto.createHash("sha256").update(value, "utf8").digest();
  
  const usernameHash = hash(username);
  const passwordHash = hash(password);
  const expectedUsernameHash = hash(env.DEMO_USER);
  const expectedPasswordHash = hash(env.DEMO_PASS);

  const isUserMatch = crypto.timingSafeEqual(usernameHash, expectedUsernameHash);
  const isPassMatch = crypto.timingSafeEqual(passwordHash, expectedPasswordHash);

  return isUserMatch && isPassMatch;
}

/**
 * Generates a JWT token with proper error handling
 * 
 * @param username - Username to include in token payload
 * @returns JWT token string
 * @throws {Error} 500 if token generation fails
 */
function generateToken(username: string): string {
  try {
    const payload: JwtPayload = { sub: username };
    
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      algorithm: JWT_ALGORITHM,
    });
  } catch (error) {
    logger.error("JWT generation failed", { error });
    throw createError("Token generation failed", 500);
  }
}

/**
 * Handles user authentication and token generation
 * 
 * Security features:
 * - Constant-time credential comparison to prevent timing attacks
 * - Generic error messages to prevent user enumeration
 * - Input validation handled by Zod middleware
 * - Proper JWT token generation with secure defaults
 * 
 * @param req - Express request object containing validated login credentials
 * @param res - Express response object for sending authentication response
 * @returns Promise<void>
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as LoginRequest;

  if (!verifyCredentials(username, password)) {
    throw createError("Invalid credentials", 401);
  }

  const token = generateToken(username);
  const response: LoginResponse = { token };
  
  res.json(response);
}

/**
 * Handles user logout
 * Note: Since JWT tokens are stateless, logout is handled client-side
 * by removing the token from storage. This endpoint provides a standard
 * logout response for consistency.
 * 
 * @param req - Express request object
 * @param res - Express response object for sending logout response
 * @returns Promise<void>
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.json({ message: "Logged out successfully" });
}
