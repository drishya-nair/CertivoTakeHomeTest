import { Request, Response, NextFunction } from "express";
import { DataService } from "../services/dataService";
import { BomData } from "@certivo/shared-types";
import HttpError from "../lib/httpError";

// Singleton instance for consistent service usage
const dataService = new DataService();

/**
 * Retrieves and returns BOM (Bill of Materials) data
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Promise<void>
 * 
 * @throws {HttpError} 404 if no BOM data is available
 * @throws {HttpError} 422 if BOM data structure is invalid
 * @throws {HttpError} 500 if data retrieval fails
 */
export async function getBom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bom: BomData = await dataService.getBomData();
    
    // Validate BOM data structure and content
    if (!bom || !Array.isArray(bom.parts) || bom.parts.length === 0) {
      throw new HttpError(404, "No BOM data available");
    }

    // Validate required BOM fields
    if (!bom.bom_id || !bom.product_name) {
      throw new HttpError(422, "Invalid BOM data structure");
    }

    res.json(bom);
  } catch (error) {
    // Re-throw HttpError instances to preserve status codes
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    
    // Handle unexpected errors
    console.error("Unexpected error in getBom:", error);
    next(new HttpError(500, "Failed to retrieve BOM data"));
  }
}
