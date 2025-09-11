import { Request, Response, NextFunction } from "express";
import { readBomJson, readCompliance} from "../utils/fileReader";
import { mergeBomAndCompliance } from "../services/dataMerger";

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const bom = await readBomJson();
    res.json(bom);
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await readCompliance();
    res.json(documents);
  } catch (err) {
    next(err);
  }
}

export async function getMerged(req: Request, res: Response, next: NextFunction) {
  try {
    const [bom, documents] = await Promise.all([readBomJson(), readCompliance()]);
    const merged = mergeBomAndCompliance(bom, documents);
    res.json(merged);
  } catch (err) {
    next(err);
  }
}