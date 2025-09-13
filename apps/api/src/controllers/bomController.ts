import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";
import HttpError from "../lib/httpError";

const dataService = new DataService();

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const bom = await dataService.getBomData();
    if (!bom || bom.parts.length === 0) {
      throw new HttpError(404, "No BOM data available");
    }
    res.json(bom);
  } catch (err) {
    next(err);
  }
}
