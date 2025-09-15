import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import { z } from "zod";

import { BomData, ComplianceEntry } from "@certivo/shared-types";
import env from "@/config/env";
import { createError } from "@/middleware/errorHandler";
import logger from "../logger";

// File system constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Data directory configuration
 * 
 * Uses custom DATA_DIR from environment if provided,
 * otherwise defaults to the relative data directory
 */
const dataDir = env.DATA_DIR
  ? path.resolve(env.DATA_DIR)
  : path.resolve(__dirname, "..", "..", "..", "data");

/**
 * File path for BOM JSON data file
 */
const bomPath = path.join(dataDir, "bom.json");
/**
 * File path for compliance CSV data file
 */
const complianceCsvPath = path.join(dataDir, "compliance.csv");

/**
 * Zod validation schemas
 */
const BomDataSchema = z.object({
  bom_id: z.string().min(1, "BOM ID is required"),
  product_name: z.string().min(1, "Product name is required"),
  parts: z.array(z.object({
    part_number: z.string().min(1, "Part number is required"),
    weight_g: z.number().positive("Weight must be positive"),
    description: z.string().optional(),
  })),
});

const ComplianceEntrySchema = z.object({
  part_number: z.string().min(1, "Part number is required"),
  substance: z.string().min(1, "Substance is required"),
  threshold_ppm: z.number().min(0, "Threshold must be non-negative"),
});

/**
 * Reads and parses BOM JSON data
 * 
 * @returns Promise<BomData> - Parsed BOM data
 */
export async function readBomJson(): Promise<BomData> {
  if (!fs.existsSync(bomPath)) {
    logger.warn(`BOM file missing at path: ${bomPath}`);
    throw createError("BOM file not found", 404);
  }

  try {
    const raw = await fs.promises.readFile(bomPath, "utf-8");
    const parsed = JSON.parse(raw);
    
    // Validate with Zod schema
    const validatedData = BomDataSchema.parse(parsed);
    return validatedData as BomData;
  } catch (error) {
    logger.error(`Failed to read BOM JSON:`, error);
    
    if (error instanceof SyntaxError) {
      throw createError("Invalid BOM JSON format", 422);
    }
    
    if (error instanceof z.ZodError) {
      throw createError("Invalid BOM data structure", 422);
    }
    
    if ((error as any).statusCode) {
      throw error;
    }
    
    throw createError("Failed to read BOM file", 500);
  }
}

/**
 * Reads compliance data from CSV file
 * 
 * @returns Promise<ComplianceEntry[]> - Array of compliance entries
 */
export async function readCompliance(): Promise<ComplianceEntry[]> {
  if (!fs.existsSync(complianceCsvPath)) {
    logger.warn(`Compliance CSV missing at path: ${complianceCsvPath}`);
    throw createError("Compliance file not found", 404);
  }

  return readComplianceCsv(complianceCsvPath);
}

/**
 * Parses CSV file into ComplianceEntry array
 * 
 * @param filePath - Path to the CSV file to parse
 * @returns Promise<ComplianceEntry[]> - Array of compliance entries
 */
async function readComplianceCsv(filePath: string): Promise<ComplianceEntry[]> {
  return new Promise((resolve, reject) => {
    const results: ComplianceEntry[] = [];

    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    
    stream
      .pipe(csv())
      .on("data", (data: Record<string, unknown>) => {
        try {
          // Parse and validate each CSV row
          const parsedData = {
            part_number: String(data.part_number || '').trim(),
            substance: String(data.substance || '').trim(),
            threshold_ppm: Number(data.threshold_ppm || 0),
          };

          const validatedEntry = ComplianceEntrySchema.parse(parsedData);
          results.push(validatedEntry);
        } catch (error) {
          // Skip invalid rows but log the issue
          logger.warn(`Skipping invalid compliance entry:`, { data, error });
        }
      })
      .on("end", () => {
        if (results.length === 0) {
          logger.warn("Compliance CSV parsed but contained no valid entries");
          reject(createError("No valid compliance data found", 422));
          return;
        }
        resolve(results);
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        logger.error(`Failed to read compliance CSV:`, err);
        reject(createError("Failed to read compliance CSV file", 500));
      });
  });
}


