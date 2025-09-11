import { Request, Response, NextFunction } from "express";
import { readCompliance } from "../utils/fileReader";

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await readCompliance();
    res.json(documents);
  } catch (err) {
    next(err);
  }
}
