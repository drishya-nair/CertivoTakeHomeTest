import { Router } from "express";
import authRoutes from "./auth";
import bomRoutes from "./bom";
import complianceRoutes from "./compliance";
import mergedRoutes from "./merged";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// API routes
router.use("/auth", authRoutes);
router.use("/bom", bomRoutes);
router.use("/compliance", complianceRoutes);
router.use("/merged", mergedRoutes);

/**
 * Main API router that combines all route modules
 * 
 * Provides health check endpoint and routes to:
 * - /auth - Authentication endpoints (login, logout)
 * - /bom - BOM (Bill of Materials) data endpoints
 * - /compliance - Compliance data endpoints
 * - /merged - Merged BOM and compliance data endpoints
 * 
 * @returns Express router with all API routes configured
 */
export default router;
