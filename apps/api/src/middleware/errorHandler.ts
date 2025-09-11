import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";
import HttpError from "../lib/httpError";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err?.stack || String(err));
  const status = (err instanceof HttpError && err.statusCode) || Number(err?.statusCode) || Number(err?.status) || 500;
  const message = String(err?.message || (status >= 500 ? "Internal Server Error" : HttpError.defaultMessage(status)));
  res.status(Number.isFinite(status) ? status : 500).json({ message });
}
