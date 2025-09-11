import { Request, Response, NextFunction } from "express";
import logger from "./logger";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err?.stack || String(err));
  const message = /not found/i.test(String(err?.message)) ? err.message : "Internal Server Error";
  const status = /not found/i.test(String(err?.message)) ? 404 : 500;
  res.status(status).json({ message });
}
