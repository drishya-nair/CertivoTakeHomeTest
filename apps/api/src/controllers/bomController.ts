import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";

const dataService = new DataService();

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const bom = await dataService.getBomData();
    res.json(bom);
  } catch (err) {
    next(err);
  }
}
