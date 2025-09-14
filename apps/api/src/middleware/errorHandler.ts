import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

/**
 * Global error handling middleware for Express applications
 * 
 * @param err - Error object or any thrown value
 * @param _req - Express request object (unused but required by Express)
 * @param res - Express response object
 * @param _next - Express next function (unused but required by Express)
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  logger.error(err?.stack || String(err));
  
  // Extract status code from error, default to 500
  const status = Number(err?.statusCode) || Number(err?.status) || 500;
  const message = err?.message || (status >= 500 ? "Internal Server Error" : "Bad Request");
  
  res.status(Number.isFinite(status) ? status : 500).json({ message });
}

/**
 * Helper function to create errors with status codes
 */
export function createError(message: string, statusCode: number = 500): Error {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}
