import { Router } from "express";
import { getBom } from "../controllers/bomController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getBom);

export default router;
