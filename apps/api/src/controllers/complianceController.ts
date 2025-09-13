import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";
import HttpError from "../lib/httpError";

const dataService = new DataService();

export async function getCompliance(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await dataService.getComplianceData();
    if (!documents || documents.length === 0) {
      throw new HttpError(404, "No compliance data available");
    }
    res.json(documents);
  } catch (err) {
    next(err);
  }
}
