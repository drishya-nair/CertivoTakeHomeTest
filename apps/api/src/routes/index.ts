import { Router } from "express";

import authRoutes from "./auth";
import bomRoutes from "./bom";
import complianceRoutes from "./compliance";
import mergedRoutes from "./merged";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.use("/auth", authRoutes);
router.use("/bom", bomRoutes);
router.use("/compliance", complianceRoutes);
router.use("/merged", mergedRoutes);

export default router;
