import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "demo-secret";
const DEMO_USER = process.env.DEMO_USER || "admin";
const DEMO_PASS = process.env.DEMO_PASS || "password";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (username === DEMO_USER && password === DEMO_PASS) {
    const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
}
