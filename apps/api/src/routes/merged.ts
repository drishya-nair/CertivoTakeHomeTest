import { Router } from "express";

import { getMerged } from "@/controllers/mergedController";
import { authenticate } from "@/middleware/auth";

const router = Router();
router.get("/", authenticate, getMerged);

export default router;
