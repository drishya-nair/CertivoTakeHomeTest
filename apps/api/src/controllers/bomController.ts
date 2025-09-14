import { Request, Response, NextFunction } from "express";
import { BomService } from "../services/bomService";

/**
 * Retrieves and returns BOM (Bill of Materials) data
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 */
export async function getBom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bom = await BomService.getBomData();
    res.json(bom);
  } catch (error) {
    next(error);
  }
}
