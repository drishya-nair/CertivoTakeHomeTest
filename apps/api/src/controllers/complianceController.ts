import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";

export async function getCompliance(req: Request, res: Response, next: NextFunction) {
  try {
    const dataService = new DataService();
    const documents = await dataService.getComplianceData();
    res.json(documents);
  } catch (err) {
    next(err);
  }
}
