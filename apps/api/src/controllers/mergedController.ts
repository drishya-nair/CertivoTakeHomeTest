import { Request, Response, NextFunction } from "express";
import { mergeBomAndCompliance } from "../services/mergeService";
import { DataService } from "../services/dataService";
import { BomData, ComplianceEntry, MergedResponse } from "@certivo/shared-types";
import HttpError from "../lib/httpError";

// Singleton instance for consistent service usage
const dataService = new DataService();

/**
 * Retrieves and merges BOM and compliance data into a unified response
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 * 
 * @throws {HttpError} 404 if required data is not available
 * @throws {HttpError} 422 if data merging fails
 * @throws {HttpError} 500 if data retrieval fails
 */
export async function getMerged(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bom, compliance: documents } = await dataService.getMergedData();
    
    // Validate input data availability
    if (!bom || !documents) {
      throw new HttpError(404, "Required data not available for merging");
    }

    // Validate data structure before merging
    if (!Array.isArray(bom.parts) || bom.parts.length === 0) {
      throw new HttpError(422, "Invalid BOM data: no parts available");
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      throw new HttpError(422, "Invalid compliance data: no entries available");
    }

    // Perform the merge operation
    const merged: MergedResponse = mergeBomAndCompliance(bom, documents);
    
    // Validate merged result
    if (!merged || !Array.isArray(merged.components) || merged.components.length === 0) {
      throw new HttpError(404, "No merged data available");
    }

    // Validate merged data structure
    if (!merged.product || typeof merged.product !== 'string') {
      throw new HttpError(422, "Invalid merged data: missing product information");
    }

    res.json(merged);
  } catch (error) {
    // Re-throw HttpError instances to preserve status codes
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in getMerged:", error);
    next(new HttpError(500, "Failed to retrieve merged data"));
  }
}
