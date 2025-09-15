import { Router } from "express";
import { z } from "zod";

import { login, logout } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

/**
 * Zod validation schema for login requests
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50, "Username too long"),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", authenticate, logout);

export default router;
