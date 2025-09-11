import { Request, Response, NextFunction } from "express";
import { readBomJson } from "../utils/fileReader";

export async function getBom(req: Request, res: Response, next: NextFunction) {
  try {
    const bom = await readBomJson();
    res.json(bom);
  } catch (err) {
    next(err);
  }
}
