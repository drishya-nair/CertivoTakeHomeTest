import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (username === env.DEMO_USER && password === env.DEMO_PASS) {
    const token = jwt.sign({ sub: username }, env.JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
}
