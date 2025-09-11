import { Request, Response, NextFunction } from "express";
import { mergeBomAndCompliance } from "../services/mergeService";
import { DataService } from "../services/dataService";

const dataService = new DataService();

export async function getMerged(req: Request, res: Response, next: NextFunction) {
  try {
    const { bom, compliance: documents } = await dataService.getMergedData();
    const merged = mergeBomAndCompliance(bom, documents);
    res.json(merged);
  } catch (err) {
    next(err);
  }
}
