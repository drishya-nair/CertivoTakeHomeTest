import { z } from "zod";
import { BomData, ComplianceEntry, MergedComponent, MergedResponse } from "@certivo/shared-types";

import { createError } from "@/middleware/errorHandler";
import { BomService } from "./bomService";
import { ComplianceService } from "./complianceService";

// Business logic constants
const ALLOWED_SUBSTANCE = "bpa";
const MASS_UNIT = "g";

/**
 * Zod validation schemas for merge service
 */
const BomDataSchema = z.object({
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
   * Combines Bill of Materials data with compliance information to create
   * a merged view showing compliance status for each component.
   * 
   * @param bom - BOM data containing product information and parts
   * @param compliance - Array of compliance entries for substances
   * @returns MergedResponse - Combined data with compliance status for each component
   * @throws {Error} 422 if input data structure is invalid
   * @throws {Error} 404 if no components are found after merging
   */
  private static mergeBomAndCompliance(bom: BomData, compliance: ComplianceEntry[]): MergedResponse {
    // Validate input data
    this.validateInputData(bom, compliance);
    
    // Create compliance lookup map for efficient searching
    const complianceMap = this.createComplianceMap(compliance);

    // Process each BOM part and merge with compliance data
    const components: MergedComponent[] = bom.parts.map((part) => 
      this.createMergedComponent(part, complianceMap)
    );

    // Validate that we have components after merging
    if (components.length === 0) {
      throw createError("No components found after merging data", 404);
    }

    return { product: bom.product_name, components };
  }

  /**
   * Validates input data structure using Zod schemas
   * 
   * @param bom - BOM data to validate
   * @param compliance - Compliance data to validate
   * @throws {Error} 422 if validation fails
   */
  private static validateInputData(bom: BomData, compliance: ComplianceEntry[]): void {
    try {
      BomDataSchema.parse(bom);
      ComplianceEntryArraySchema.parse(compliance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError("Invalid data structure", 422);
      }
      throw error;
    }
  }

  /**
   * Creates a compliance lookup map for efficient searching
   * 
   * @param compliance - Array of compliance entries
   * @returns Map with uppercase part numbers as keys
   */
  private static createComplianceMap(compliance: ComplianceEntry[]): Map<string, ComplianceEntry> {
    return new Map<string, ComplianceEntry>(
      compliance.map((entry) => [entry.part_number.trim().toUpperCase(), entry] as const)
    );
  }

  /**
   * Creates a merged component from BOM part and compliance data
   * 
   * @param part - BOM part data
   * @param complianceMap - Compliance lookup map
   * @returns MergedComponent with compliance status
   */
  private static createMergedComponent(part: any, complianceMap: Map<string, ComplianceEntry>): MergedComponent {
    const partId = part.part_number.trim();
    const entry = complianceMap.get(partId.toUpperCase());
    const massStr = `${part.weight_g}${MASS_UNIT}`;

    if (!entry) {
      return {
        id: partId,
        substance: null,
        mass: massStr,
        threshold_ppm: null,
        status: "Unknown",
        material: part.material,
      };
    }

    // Determine compliance status based on substance
    const isCompliant = entry.substance.trim().toLowerCase() === ALLOWED_SUBSTANCE;
    
    return {
      id: partId,
      substance: entry.substance,
      mass: massStr,
      threshold_ppm: entry.threshold_ppm,
      status: isCompliant ? "Compliant" : "Non-Compliant",
      material: part.material,
    };
  }
}

