import { Router } from "express";

import { getBom } from "@/controllers/bomController";
import { authenticate } from "@/middleware/auth";

const router = Router();
router.get("/", authenticate, getBom);

/**
 * BOM (Bill of Materials) routes
 * 
 * Provides endpoints for accessing BOM data:
 * - GET / - Retrieves complete BOM data (requires authentication)
 * 
 * All routes require JWT authentication via the authenticate middleware
 * 
 * @returns Express router with BOM-specific routes
 */
export default router;
