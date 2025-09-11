import { Router } from "express";
import { getDocuments } from "../controllers/complianceController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getDocuments);

export default router;
