import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { z } from "zod";

import { BomData, ComplianceEntry } from "@certivo/shared-types";
import env from "@/config/env";
import { createError } from "@/middleware/errorHandler";
import logger from "../logger";

// File system setup
const dataDir = env.DATA_DIR
  ? path.resolve(env.DATA_DIR)
  : path.resolve(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");

// Validation schemas
const BomDataSchema = z.object({
  bom_id: z.string().min(1),
  product_name: z.string().min(1),
  parts: z.array(z.object({
    part_number: z.string().min(1),
    weight_g: z.number().positive(),
    material: z.string().optional(),
    description: z.string().optional(),
  })),
});

const ComplianceEntrySchema = z.object({
  part_number: z.string().min(1),
  substance: z.string().min(1),
  threshold_ppm: z.number().min(0),
  substance_mass_mg: z.number().min(0),
});

/**
 * Reads and parses BOM JSON data with validation
 * 
 * @returns Promise<BomData> - Parsed and validated BOM data
 */
export async function readBomJson(): Promise<BomData> {
  if (!fs.existsSync(bomPath)) {
    logger.warn(`BOM file missing at path: ${bomPath}`);
    throw createError("BOM file not found", 404);
  }

  try {
    const raw = await fs.promises.readFile(bomPath, "utf-8");
    const parsed = JSON.parse(raw);
    return BomDataSchema.parse(parsed) as BomData;
  } catch (error) {
    logger.error("Failed to read BOM JSON:", error);
    
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
 * Parses CSV file into ComplianceEntry array with validation
 * 
 * @param filePath - Path to the CSV file to parse
 * @returns Promise<ComplianceEntry[]> - Array of compliance entries
 */
async function readComplianceCsv(filePath: string): Promise<ComplianceEntry[]> {
  return new Promise((resolve, reject) => {
    const results: ComplianceEntry[] = [];

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv())
      .on("data", (data: Record<string, unknown>) => {
        try {
          const parsedData = {
            part_number: String(data.part_number || '').trim(),
            substance: String(data.substance || '').trim(),
            threshold_ppm: Number(data.threshold_ppm || 0),
            substance_mass_mg: Number(data.substance_mass_mg || 0),
          };

          results.push(ComplianceEntrySchema.parse(parsedData));
        } catch (error) {
          logger.warn("Skipping invalid compliance entry:", { data, error });
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
        logger.error("Failed to read compliance CSV:", err);
        reject(createError("Failed to read compliance CSV file", 500));
      });
  });
}


