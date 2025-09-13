import fs from "fs";
import path from "path";
import csv from "csv-parser";
import logger from "../logger";
import { BomData, ComplianceEntry } from "@certivo/shared-types";
import { fileURLToPath } from "url";
import env from "../../config/env";
import HttpError from "../httpError";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = env.DATA_DIR
  ? path.resolve(env.DATA_DIR)
  : path.resolve(__dirname, "..", "..", "..", "data");
const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");

// internal data directory resolver; tests use their own helper to avoid exporting test-only APIs

/**
 * Validates that a parsed CSV row contains the required fields for ComplianceEntry
 */
function validateComplianceEntry(data: Record<string, unknown>): ComplianceEntry {
  const partNumber = data.part_number;
  const substance = data.substance;
  const thresholdPpm = data.threshold_ppm;

  if (typeof partNumber !== 'string' || !partNumber.trim()) {
    throw new Error(`Invalid part_number: expected non-empty string, got ${typeof partNumber}`);
  }

  if (typeof substance !== 'string' || !substance.trim()) {
    throw new Error(`Invalid substance: expected non-empty string, got ${typeof substance}`);
  }

  const threshold = Number(thresholdPpm);
  if (!Number.isFinite(threshold) || threshold < 0) {
    throw new Error(`Invalid threshold_ppm: expected non-negative number, got ${thresholdPpm}`);
  }

  return {
    part_number: partNumber.trim(),
    substance: substance.trim(),
    threshold_ppm: threshold,
  };
}

/**
 * Reads and parses BOM JSON data with proper error handling
 */
export async function readBomJson(): Promise<BomData> {
  if (!fs.existsSync(bomPath)) {
    logger.error(`BOM file not found at ${bomPath}`);
    throw new HttpError(404, "BOM file not found at configured path");
  }

  try {
    const raw = await fs.promises.readFile(bomPath, "utf-8");
    const parsed = JSON.parse(raw);
    
    // Basic validation of BOM structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Invalid BOM JSON: expected object");
    }
    
    if (!Array.isArray(parsed.parts)) {
      throw new Error("Invalid BOM JSON: expected 'parts' array");
    }

    return parsed as BomData;
  } catch (error) {
    logger.error(`Failed to read/parse BOM JSON at ${bomPath}:`, error);
    
    if (error instanceof SyntaxError) {
      throw new HttpError(422, "Invalid BOM JSON format");
    }
    
    if (error instanceof Error && error.message.startsWith("Invalid BOM JSON")) {
      throw new HttpError(422, error.message);
    }
    
    throw new HttpError(500, "Failed to read BOM file");
  }
}

/**
 * Reads compliance data from CSV file with proper validation
 */
export async function readCompliance(): Promise<ComplianceEntry[]> {
  if (!fs.existsSync(complianceCsvPath)) {
    logger.error(`Compliance file not found at ${complianceCsvPath}`);
    throw new HttpError(404, "Compliance file not found in data directory");
  }

  return readComplianceCsv(complianceCsvPath);
}

/**
 * Parses CSV file into ComplianceEntry array with proper error handling and validation
 */
async function readComplianceCsv(filePath: string): Promise<ComplianceEntry[]> {
  return new Promise((resolve, reject) => {
    const results: ComplianceEntry[] = [];
    let rowCount = 0;
    let errorCount = 0;

    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    
    stream
      .pipe(csv())
      .on("data", (data: Record<string, unknown>) => {
        try {
          rowCount++;
          const validatedEntry = validateComplianceEntry(data);
          results.push(validatedEntry);
        } catch (error) {
          errorCount++;
          logger.warn(`Invalid CSV row ${rowCount}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Continue processing other rows unless too many errors
          if (errorCount > 10) {
            reject(new HttpError(422, `Too many invalid CSV rows (${errorCount} errors in ${rowCount} rows)`));
            return;
          }
        }
      })
      .on("end", () => {
        if (results.length === 0) {
          reject(new HttpError(422, "No valid compliance data found in CSV file"));
          return;
        }
        
        if (errorCount > 0) {
          logger.warn(`Processed ${rowCount} rows with ${errorCount} errors, ${results.length} valid entries`);
        }
        
        resolve(results);
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        logger.error(`Failed to read compliance CSV at ${filePath}:`, err);
        
        if (err.code === 'ENOENT') {
          reject(new HttpError(404, "Compliance CSV file not found"));
        } else if (err.code === 'EACCES') {
          reject(new HttpError(403, "Permission denied reading compliance CSV file"));
        } else {
          reject(new HttpError(500, "Failed to read compliance CSV file"));
        }
      });
  });
}


