import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });
  const [scheme, tokenCandidate] = header.split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !tokenCandidate) {
    return res.status(401).json({ message: "Invalid Authorization header format" });
  }
  const token = tokenCandidate.trim();
  try {
    jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
