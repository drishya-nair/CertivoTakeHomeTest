import { z } from "zod";
import { BomData, ComplianceEntry, MergedComponent, MergedResponse } from "@certivo/shared-types";

import { createError } from "@/middleware/errorHandler";
import { BomService } from "./bomService";
import { ComplianceService } from "./complianceService";

// Business logic constants
const ALLOWED_SUBSTANCE = "bpa";
const MASS_UNIT = "g";

// Validation schemas for runtime type checking
const BomDataSchema = z.object({
  bom_id: z.string().min(1),
  product_name: z.string().min(1),
  parts: z.array(z.object({
    part_number: z.string().min(1),
    weight_g: z.number().positive(),
    material: z.string().optional(),
  })),
});

const ComplianceEntryArraySchema = z.array(z.object({
  part_number: z.string().min(1),
  substance: z.string().min(1),
  threshold_ppm: z.number().min(0),
}));

/**
 * Service for merging BOM and compliance data
 * 
 * Handles business logic related to combining BOM and compliance data
 * into a unified response showing compliance status for each component.
 */
export class MergeService {
  /**
   * Retrieves and merges BOM and compliance data into a unified response
   * 
   * @returns Promise<MergedResponse> - Combined data with compliance status for each component
   * @throws {Error} 422 if input data structure is invalid
   * @throws {Error} 404 if no components are found after merging
   */
  static async getMergedData(): Promise<MergedResponse> {
    const [bom, compliance] = await Promise.all([
      BomService.getBomData(),
      ComplianceService.getComplianceData()
    ]);
    
    return this.mergeBomAndCompliance(bom, compliance);
  }

  /**
   * Merges BOM and compliance data into a unified response
   * 
   * @param bom - BOM data containing product information and parts
   * @param compliance - Array of compliance entries for substances
   * @returns MergedResponse - Combined data with compliance status for each component
   * @throws {Error} 422 if input data structure is invalid
   * @throws {Error} 404 if no components are found after merging
   */
  private static mergeBomAndCompliance(bom: BomData, compliance: ComplianceEntry[]): MergedResponse {
    // Validate input data structure
    try {
      BomDataSchema.parse(bom);
      ComplianceEntryArraySchema.parse(compliance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError("Invalid data structure", 422);
      }
      throw error;
    }

    if (!bom.parts?.length) {
      throw createError("No components found after merging data", 404);
    }

    // Create compliance lookup for efficient searching
    const complianceLookup = new Map(
      compliance.map(entry => [entry.part_number.trim().toUpperCase(), entry])
    );

    // Process each BOM part and merge with compliance data
    const components: MergedComponent[] = bom.parts.map(part => {
      const partId = part.part_number.trim();
      const entry = complianceLookup.get(partId.toUpperCase());
      const mass = `${part.weight_g}${MASS_UNIT}`;

      if (!entry) {
        return {
          id: partId,
          substance: null,
          mass,
          threshold_ppm: null,
          status: "Unknown",
          material: part.material,
        };
      }

      const isCompliant = entry.substance.trim().toLowerCase() === ALLOWED_SUBSTANCE;
      
      return {
        id: partId,
        substance: entry.substance,
        mass,
        threshold_ppm: entry.threshold_ppm,
        status: isCompliant ? "Compliant" : "Non-Compliant",
        material: part.material,
      };
    });

    return { product: bom.product_name, components };
  }
}

