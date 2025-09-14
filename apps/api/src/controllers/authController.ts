import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env";
import { createError } from "../middleware/errorHandler";

// Constants for security and validation
const MAX_INPUT_LENGTH = 256;
const TOKEN_EXPIRY = "2h";
const JWT_ALGORITHM = "HS256" as const;

// Type definitions for better type safety
/**
 * Request payload for user login
 */
interface LoginRequest {
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
}

/**
 * Response payload for successful login
 */
interface LoginResponse {
  /** JWT token for authenticated requests */
  token: string;
}

/**
 * JWT token payload structure
 */
interface JwtPayload {
  /** Subject (username) identifier */
  sub: string;
  /** Issued at timestamp */
  iat?: number;
  /** Expiration timestamp */
  exp?: number;
}

/**
 * Validates login request input with comprehensive checks
 * 
 * @param body - Raw request body to validate
 * @returns Validated LoginRequest object
 * @throws {Error} 400 if validation fails
 */
function validateLoginInput(body: unknown): LoginRequest {
  if (!body || typeof body !== "object") {
    throw createError("Invalid request body", 400);
  }

  const { username, password } = body as Record<string, unknown>;

  if (typeof username !== "string" || typeof password !== "string") {
    throw createError("Invalid request body", 400);
  }

  // Trim whitespace and validate length
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw createError("Invalid request body", 400);
  }

  if (trimmedUsername.length > MAX_INPUT_LENGTH || trimmedPassword.length > MAX_INPUT_LENGTH) {
    throw createError("Invalid request body", 400);
  }

  return {
    username: trimmedUsername,
    password: trimmedPassword,
  };
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
    console.error("JWT generation failed:", error);
    throw createError("Token generation failed", 500);
  }
}

/**
 * Handles user authentication and token generation
 * 
 * Security features:
 * - Constant-time credential comparison to prevent timing attacks
 * - Generic error messages to prevent user enumeration
 * - Input validation and sanitization
 * - Proper JWT token generation with secure defaults
 * 
 * @param req - Express request object containing login credentials
 * @param res - Express response object for sending authentication response
 * @returns Promise<void>
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = validateLoginInput(req.body);

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
