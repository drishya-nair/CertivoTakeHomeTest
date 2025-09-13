import { Router } from "express";
import { login, logout } from "../controllers/authController";
import { validateLogin } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/login", validateLogin, login);
router.post("/logout", authenticate, logout);

export default router;
