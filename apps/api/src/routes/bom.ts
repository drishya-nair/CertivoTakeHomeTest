import { Router } from "express";
import { getBom } from "../controllers/bomController";
import { authenticate } from "../middleware/auth";
import { validateBomData } from "../middleware/validation";

const router = Router();

router.get("/", authenticate, getBom);
router.post("/", authenticate, validateBomData, (req, res) => {
  res.json({ message: "BOM data validated successfully" });
});

export default router;
