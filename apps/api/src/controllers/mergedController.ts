import { Request, Response, NextFunction } from "express";
import { mergeBomAndCompliance } from "../services/mergeService";
import { DataService } from "../services/dataService";
import HttpError from "../lib/httpError";

const dataService = new DataService();

export async function getMerged(req: Request, res: Response, next: NextFunction) {
  try {
    const { bom, compliance: documents } = await dataService.getMergedData();
    if (!bom || !documents) {
      throw new HttpError(404, "Required data not available for merging");
    }
    const merged = mergeBomAndCompliance(bom, documents);
    if (!merged || !merged.components || merged.components.length === 0) {
      throw new HttpError(404, "No merged data available");
    }
    res.json(merged);
  } catch (err) {
    next(err);
  }
}
