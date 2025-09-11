import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";

const dataService = new DataService();

export async function getCompliance(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await dataService.getComplianceData();
    res.json(documents);
  } catch (err) {
    next(err);
  }
}
