import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import env from "@/config/env";

// Authentication constants
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
 */
interface JwtPayload extends jwt.JwtPayload {
  sub?: string;
}

/**
 * Middleware to authenticate JWT tokens
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void | Response {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  
  const token = authHeader.substring(7).trim();
  
  if (!token) {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { 
      algorithms: [JWT_ALGORITHM] 
    }) as JwtPayload;
    
    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
    req.user = { username: decoded.sub };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    
    if (error instanceof jwt.NotBeforeError) {
      return res.status(401).json({ message: "Token not active" });
    }
    
    return res.status(401).json({ message: "Invalid token" });
  }
}
