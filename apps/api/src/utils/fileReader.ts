import fs from "fs";
import path from "path";
import csv from "csv-parser";
import logger from "../middleware/logger";
import { BomData, ComplianceEntry } from "@certivo/shared-types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "..", "..", "..", "..", "data");
const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");
const complianceJsonPath = path.join(dataDir, "compliance.json");

export function ensureDataDir(): string {
  return dataDir;
}

export async function readBomJson(): Promise<BomData> {
  if (!fs.existsSync(bomPath)) {
    logger.error(`BOM file not found at ${bomPath}`);
    throw new Error("BOM file not found at configured path");
  }
  try {
    const raw = await fs.promises.readFile(bomPath, "utf-8");
    return JSON.parse(raw) as BomData;
  } catch (e) {
    logger.error(`Failed to parse BOM JSON at ${bomPath}`);
    throw new Error("Invalid BOM JSON format");
  }
}

export async function readCompliance(): Promise<ComplianceEntry[]> {
  if (fs.existsSync(complianceCsvPath)) return readComplianceCsv(complianceCsvPath);
  logger.error(`Compliance file not found in ${dataDir} (expected CSV or JSON)`);
  throw new Error("Compliance file not found in data directory");
}

async function readComplianceCsv(filePath: string): Promise<ComplianceEntry[]> {
  return new Promise((resolve, reject) => {
    const results: ComplianceEntry[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: any) => {
        results.push({
          part_number: String(data.part_number).trim(),
          substance: String(data.substance).trim(),
          threshold_ppm: Number(data.threshold_ppm),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

export const paths = { dataDir, bomPath, complianceCsvPath, complianceJsonPath };
