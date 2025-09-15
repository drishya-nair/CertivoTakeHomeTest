import { Router } from "express";
import { z } from "zod";

import { login, refresh } from "@/controllers/authController";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Validation schema for login requests
const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refresh);

export default router;
