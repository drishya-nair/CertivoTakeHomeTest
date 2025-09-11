import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const dataService = new DataService();
    const bom = await dataService.getBomData();
    res.json(bom);
  } catch (err) {
    next(err);
  }
}
