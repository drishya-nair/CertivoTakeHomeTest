import { Router } from "express";
import { getMerged } from "../controllers/mergedController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.get("/", authenticate, getMerged);

/**
 * Merged data routes
 * 
 * Provides endpoints for accessing merged BOM and compliance data:
 * - GET / - Retrieves merged data combining BOM and compliance information (requires authentication)
 * 
 * All routes require JWT authentication via the authenticate middleware
 * 
 * @returns Express router with merged data routes
 */
export default router;
