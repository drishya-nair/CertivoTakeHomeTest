import { Router } from "express";
import { getCompliance } from "../controllers/complianceController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.get("/", authenticate, getCompliance);

export default router;
