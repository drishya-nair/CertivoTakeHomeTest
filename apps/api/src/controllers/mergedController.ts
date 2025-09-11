import { Request, Response, NextFunction } from "express";
import { readBomJson, readCompliance } from "../utils/fileReader";
import { mergeBomAndCompliance } from "../services/mergeService";

export async function getMerged(req: Request, res: Response, next: NextFunction) {
  try {
    const [bom, documents] = await Promise.all([readBomJson(), readCompliance()]);
    const merged = mergeBomAndCompliance(bom, documents);
    res.json(merged);
  } catch (err) {
    next(err);
  }
}
