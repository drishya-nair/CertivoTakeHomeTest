import { Router } from "express";

import { getCompliance } from "@/controllers/complianceController";
import { authenticate } from "@/middleware/auth";

const router = Router();
router.get("/", authenticate, getCompliance);

/**
 * Compliance routes
 * 
 * Provides endpoints for accessing compliance data:
 * - GET / - Retrieves complete compliance data (requires authentication)
 * 
 * All routes require JWT authentication via the authenticate middleware
 * 
 * @returns Express router with compliance-specific routes
 */
export default router;
