import fs from "fs";
import path from "path";
import csv from "csv-parser";
import logger from "./logger";
import { BomData, ComplianceEntry } from "../types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "..", "..", "data");
const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");

export function ensureDataDir(): string {
  return dataDir;
}

export async function readBomJson(): Promise<BomData> {
  if (!fs.existsSync(bomPath)) {
    logger.error(`BOM file not found at ${bomPath}`);
    throw new Error("BOM file not found");
  }
  const raw = await fs.promises.readFile(bomPath, "utf-8");
  const parsed = JSON.parse(raw) as BomData;
  return parsed;
}

export async function readCompliance(): Promise<ComplianceEntry[]> {
  if (fs.existsSync(complianceCsvPath)) {
    return readComplianceCsv(complianceCsvPath);
  }
  logger.error("Compliance CSV file not found");
  throw new Error("Compliance CSV file not found");
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


export async function writeBomJson(data: BomData): Promise<void> {
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.writeFile(bomPath, JSON.stringify(data, null, 2));
}

export const paths = { dataDir, bomPath, complianceCsvPath };


