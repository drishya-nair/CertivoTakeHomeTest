import { Request, Response, NextFunction } from "express";
import { ComplianceService } from "../services/complianceService";

/**
 * Retrieves and returns compliance data
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 */
export async function getCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const documents = await ComplianceService.getComplianceData();
    res.json(documents);
  } catch (error) {
    next(error);
  }
}
