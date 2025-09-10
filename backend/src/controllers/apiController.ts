import { Request, Response, NextFunction } from "express";
import { readBomJson, readCompliance, writeBomJson } from "../utils/fileReader";
import { mergeBomAndCompliance } from "../services/dataMerger";
import logger from "../utils/logger";
import { BomData } from "../types";

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const bom = await readBomJson();
    res.json(bom);
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await readCompliance();
    res.json(documents);
  } catch (err) {
    next(err);
  }
}

export async function getMerged(req: Request, res: Response, next: NextFunction) {
  try {
    const [bom, documents] = await Promise.all([readBomJson(), readCompliance()]);
    const merged = mergeBomAndCompliance(bom, documents);
    res.json(merged);
  } catch (err) {
    next(err);
  }
}

export async function postBom(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as BomData; // Already validated by middleware
    await writeBomJson(body);
    logger.info("BOM updated via POST /bom");
    // Notify via websocket if available
    const io = req.app.get("io");
    if (io) io.emit("bom:updated", { bom_id: body.bom_id });
    res.status(201).json({ message: "BOM saved" });
  } catch (err) {
    next(err);
  }
}


