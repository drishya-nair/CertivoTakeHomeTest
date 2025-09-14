import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import env from "@/config/env";

// Authentication constants
const BEARER_SCHEME = "bearer";
const JWT_ALGORITHM = "HS256" as const;

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}

/**
 * JWT payload interface for type safety
 * 
 * Extends the base JWT payload with our specific claims
 * used for user authentication and authorization
 */
interface JwtPayload extends jwt.JwtPayload {
  /** Subject (username) identifier from the JWT token */
  sub?: string;
}

/**
 * Middleware to authenticate JWT tokens
 * 
 * Validates the Authorization header and verifies the JWT token.
 * On successful authentication, attaches user information to the request object.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 * 
 * @throws {Response} 401 if Authorization header is missing
 * @throws {Response} 401 if Authorization header format is invalid
 * @throws {Response} 401 if JWT token is invalid or expired
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void | Response {
  const header = req.headers.authorization;
  
  // Check if Authorization header exists
  if (!header) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }
  
  // Parse Authorization header
  const [scheme, tokenCandidate] = header.split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== BEARER_SCHEME || !tokenCandidate) {
    return res.status(401).json({ message: "Invalid Authorization header format" });
  }
  
  const token = tokenCandidate.trim();
  
  // Validate token is not empty
  if (!token) {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET, { 
      algorithms: [JWT_ALGORITHM] 
    }) as JwtPayload;
    
    // Validate required payload fields
    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
    // Attach user information to request object
    req.user = {
      username: decoded.sub
    };
    
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    
    if (error instanceof jwt.NotBeforeError) {
      return res.status(401).json({ message: "Token not active" });
    }
    
    // Generic error for other JWT errors
    return res.status(401).json({ message: "Invalid token" });
  }
}
