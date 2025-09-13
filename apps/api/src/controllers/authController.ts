import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env";
import HttpError from "../lib/httpError";

export async function login(req: Request, res: Response) {
  const username = req.body?.username;
  const password = req.body?.password;

  // Basic input validation—keep responses generic to avoid user enumeration
  if (typeof username !== "string" || typeof password !== "string") {
    throw new HttpError(400, "Invalid request body");
  }

  // Optional sane limits to mitigate abuse
  if (username.length > 256 || password.length > 256) {
    throw new HttpError(400, "Invalid request body");
  }

  // Constant-time comparison using fixed-length SHA-256 digests
  const hash = (v: string) => crypto.createHash("sha256").update(v, "utf8").digest();
  const isUserMatch = crypto.timingSafeEqual(hash(username), hash(env.DEMO_USER));
  const isPassMatch = crypto.timingSafeEqual(hash(password), hash(env.DEMO_PASS));

  if (isUserMatch && isPassMatch) {
    try {
      const token = jwt.sign({ sub: username }, env.JWT_SECRET, {
        expiresIn: "2h",
        algorithm: "HS256",
      });
      return res.json({ token });
    } catch {
      throw new HttpError(500, "Token generation failed");
    }
  }

  throw new HttpError(401, "Invalid credentials");
}
