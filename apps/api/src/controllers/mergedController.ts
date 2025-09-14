import { Request, Response, NextFunction } from "express";
import { MergeService } from "../services/mergeService";

/**
 * Retrieves and merges BOM and compliance data into a unified response
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 */
export async function getMerged(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const merged = await MergeService.getMergedData();
    res.json(merged);
  } catch (error) {
    next(error);
  }
}
