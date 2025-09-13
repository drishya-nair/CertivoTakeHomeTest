import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";
import { ComplianceEntry } from "@certivo/shared-types";
import HttpError from "../lib/httpError";

// Singleton instance for consistent service usage
const dataService = new DataService();

/**
 * Retrieves and returns compliance data
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 * 
 * @throws {HttpError} 404 if no compliance data is available
 * @throws {HttpError} 422 if compliance data structure is invalid
 * @throws {HttpError} 500 if data retrieval fails
 */
export async function getCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const documents: ComplianceEntry[] = await dataService.getComplianceData();
    
    // Validate compliance data structure and content
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new HttpError(404, "No compliance data available");
    }

    // Validate compliance data integrity
    const hasValidEntries = documents.every(entry => 
      entry && 
      typeof entry.part_number === 'string' && 
      typeof entry.substance === 'string' && 
      typeof entry.threshold_ppm === 'number'
    );

    if (!hasValidEntries) {
      throw new HttpError(422, "Invalid compliance data structure");
    }

    res.json(documents);
  } catch (error) {
    // Re-throw HttpError instances to preserve status codes
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in getCompliance:", error);
    next(new HttpError(500, "Failed to retrieve compliance data"));
  }
}
