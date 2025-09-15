import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import env from "@/config/env";
import { createError } from "@/middleware/errorHandler";
import logger from "@/lib/logger";

// Security constants
const TOKEN_EXPIRY = "2h";
const JWT_ALGORITHM = "HS256" as const;

// Pre-computed credential hashes for constant-time comparison
const expectedUsernameHash = crypto.createHash("sha256").update(env.DEMO_USER).digest();
const expectedPasswordHash = crypto.createHash("sha256").update(env.DEMO_PASS).digest();

/**
 * Request payload for user login
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Verifies credentials using constant-time comparison to prevent timing attacks
 * 
 * @param username - Username to verify
 * @param password - Password to verify
 * @returns True if credentials match
 */
function verifyCredentials(username: string, password: string): boolean {
  const usernameHash = crypto.createHash("sha256").update(username).digest();
  const passwordHash = crypto.createHash("sha256").update(password).digest();
  
  return crypto.timingSafeEqual(usernameHash, expectedUsernameHash) &&
         crypto.timingSafeEqual(passwordHash, expectedPasswordHash);
}

/**
 * Generates a JWT token
 * 
 * @param username - Username to include in token
 * @returns JWT token string
 */
function generateToken(username: string): string {
  try {
    return jwt.sign({ sub: username }, env.JWT_SECRET, {
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
 * @param req - Express request with login credentials
 * @param res - Express response object
 * @param next - Express next function
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!verifyCredentials(username, password)) {
      throw createError("Invalid credentials", 401);
    }

    res.json({ token: generateToken(username) });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles token refresh by validating existing token and issuing a new one
 * 
 * @param req - Express request with Authorization header
 * @param res - Express response object
 * @param next - Express next function
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      throw createError("Invalid token", 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as { sub: string };
    
    res.json({ token: generateToken(decoded.sub) });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError("Invalid token", 401);
    }
    next(error);
  }
}
