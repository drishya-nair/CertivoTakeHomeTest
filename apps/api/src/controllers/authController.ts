import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env";
import HttpError from "../lib/httpError";

// Constants for security and validation
const MAX_INPUT_LENGTH = 256;
const TOKEN_EXPIRY = "2h";
const JWT_ALGORITHM = "HS256" as const;

// Type definitions for better type safety
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

/**
 * Validates login request input with comprehensive checks
 */
function validateLoginInput(body: unknown): LoginRequest {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }

  const { username, password } = body as Record<string, unknown>;

  if (typeof username !== "string" || typeof password !== "string") {
    throw new HttpError(400, "Invalid request body");
  }

  // Trim whitespace and validate length
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new HttpError(400, "Invalid request body");
  }

  if (trimmedUsername.length > MAX_INPUT_LENGTH || trimmedPassword.length > MAX_INPUT_LENGTH) {
    throw new HttpError(400, "Invalid request body");
  }

  return {
    username: trimmedUsername,
    password: trimmedPassword,
  };
}

/**
 * Performs constant-time comparison using SHA-256 hashes
 * Prevents timing attacks by ensuring comparison time is independent of input
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
 */
function generateToken(username: string): string {
  try {
    const payload: JwtPayload = { sub: username };
    
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      algorithm: JWT_ALGORITHM,
    });
  } catch (error) {
    // Log the actual error for debugging (in production, use proper logging)
    console.error("JWT generation failed:", error);
    throw new HttpError(500, "Token generation failed");
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
 * 
 * @throws {HttpError} 400 if request body is invalid or missing required fields
 * @throws {HttpError} 401 if credentials are invalid
 * @throws {HttpError} 500 if token generation fails or unexpected error occurs
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = validateLoginInput(req.body);

    if (!verifyCredentials(username, password)) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = generateToken(username);
    const response: LoginResponse = { token };
    
    res.json(response);
  } catch (error) {
    // Re-throw HttpError instances to preserve status codes
    if (error instanceof HttpError) {
      throw error;
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in login:", error);
    throw new HttpError(500, "Authentication failed");
  }
}
