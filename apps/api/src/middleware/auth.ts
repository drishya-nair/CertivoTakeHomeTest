import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

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

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });
  
  const [scheme, tokenCandidate] = header.split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !tokenCandidate) {
    return res.status(401).json({ message: "Invalid Authorization header format" });
  }
  
  const token = tokenCandidate.trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
    
    // Attach user information to request object
    req.user = {
      username: decoded.sub || ""
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
