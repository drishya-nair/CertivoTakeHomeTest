import fs from "fs";
import path from "path";
import csv from "csv-parser";
import logger from "../logger";
import { BomData, ComplianceEntry } from "@certivo/shared-types";
import { fileURLToPath } from "url";
import env from "../../config/env";
import HttpError from "../httpError";

// File system constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory configuration
const dataDir = env.DATA_DIR
  ? path.resolve(env.DATA_DIR)
  : path.resolve(__dirname, "..", "..", "..", "data");

// File paths
const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");

// Validation constants
const MAX_CSV_ERRORS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for security

// Internal data directory resolver; tests use their own helper to avoid exporting test-only APIs

/**
 * Validates that a parsed CSV row contains the required fields for ComplianceEntry
 * 
 * @param data - Raw CSV row data to validate
 * @returns Validated ComplianceEntry object
 * @throws {Error} If validation fails for any required field
 */
function validateComplianceEntry(data: Record<string, unknown>): ComplianceEntry {
  const partNumber = data.part_number;
  const substance = data.substance;
  const thresholdPpm = data.threshold_ppm;

  // Validate part_number
  if (typeof partNumber !== 'string' || !partNumber.trim()) {
    throw new Error(`Invalid part_number: expected non-empty string, got ${typeof partNumber}`);
  }

  // Validate substance
  if (typeof substance !== 'string' || !substance.trim()) {
    throw new Error(`Invalid substance: expected non-empty string, got ${typeof substance}`);
  }

  // Validate threshold_ppm
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
 * Reads and parses BOM JSON data with comprehensive validation and security checks
 * 
 * @returns Promise<BomData> - Parsed and validated BOM data
 * @throws {HttpError} 404 if BOM file is not found
 * @throws {HttpError} 422 if BOM JSON format is invalid
 * @throws {HttpError} 413 if file size exceeds maximum allowed size
 * @throws {HttpError} 500 if file read operation fails
 */
export async function readBomJson(): Promise<BomData> {
  // Check if file exists
  if (!fs.existsSync(bomPath)) {
    logger.error(`BOM file not found at ${bomPath}`);
    throw new HttpError(404, "BOM file not found at configured path");
  }

  try {
    // Get file stats for security validation
    const stats = await fs.promises.stat(bomPath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new HttpError(413, "BOM file size exceeds maximum allowed limit");
    }

    // Read and parse file
    const raw = await fs.promises.readFile(bomPath, "utf-8");
    const parsed = JSON.parse(raw);
    
    // Validate BOM structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Invalid BOM JSON: expected object");
    }
    
    if (!Array.isArray(parsed.parts)) {
      throw new Error("Invalid BOM JSON: expected 'parts' array");
    }

    // Validate required fields
    if (!parsed.bom_id || !parsed.product_name) {
      throw new Error("Invalid BOM JSON: missing required fields (bom_id, product_name)");
    }

    return parsed as BomData;
  } catch (error) {
    logger.error(`Failed to read/parse BOM JSON at ${bomPath}:`, error);
    
    // Handle specific error types
    if (error instanceof HttpError) {
      throw error;
    }
    
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
 * Reads compliance data from CSV file with comprehensive validation and security checks
 * 
 * @returns Promise<ComplianceEntry[]> - Array of validated compliance entries
 * @throws {HttpError} 404 if compliance file is not found
 * @throws {HttpError} 413 if file size exceeds maximum allowed size
 * @throws {HttpError} 422 if CSV format is invalid or contains too many errors
 * @throws {HttpError} 500 if file read operation fails
 */
export async function readCompliance(): Promise<ComplianceEntry[]> {
  // Check if file exists
  if (!fs.existsSync(complianceCsvPath)) {
    logger.error(`Compliance file not found at ${complianceCsvPath}`);
    throw new HttpError(404, "Compliance file not found in data directory");
  }

  // Validate file size before processing
  try {
    const stats = await fs.promises.stat(complianceCsvPath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new HttpError(413, "Compliance file size exceeds maximum allowed limit");
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error(`Failed to get file stats for ${complianceCsvPath}:`, error);
    throw new HttpError(500, "Failed to validate compliance file");
  }

  return readComplianceCsv(complianceCsvPath);
}

/**
 * Parses CSV file into ComplianceEntry array with comprehensive error handling and validation
 * 
 * @param filePath - Path to the CSV file to parse
 * @returns Promise<ComplianceEntry[]> - Array of validated compliance entries
 * @throws {HttpError} 404 if file is not found
 * @throws {HttpError} 403 if permission denied
 * @throws {HttpError} 422 if too many invalid rows or no valid data found
 * @throws {HttpError} 500 if file read operation fails
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
          
          // Stop processing if too many errors to prevent resource exhaustion
          if (errorCount > MAX_CSV_ERRORS) {
            reject(new HttpError(422, `Too many invalid CSV rows (${errorCount} errors in ${rowCount} rows)`));
            return;
          }
        }
      })
      .on("end", () => {
        // Validate that we have at least some valid data
        if (results.length === 0) {
          reject(new HttpError(422, "No valid compliance data found in CSV file"));
          return;
        }
        
        // Log processing summary if there were errors
        if (errorCount > 0) {
          logger.warn(`Processed ${rowCount} rows with ${errorCount} errors, ${results.length} valid entries`);
        }
        
        resolve(results);
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        logger.error(`Failed to read compliance CSV at ${filePath}:`, err);
        
        // Handle specific file system errors
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


