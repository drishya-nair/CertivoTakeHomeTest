import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { parseStringPromise } from "xml2js";
import logger from "./logger";
import { BomData, ComplianceEntry } from "../types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "..", "..", "data");
const bomPath = path.join(dataDir, "bom.json");
const complianceCsvPath = path.join(dataDir, "compliance.csv");
const complianceXmlPath = path.join(dataDir, "compliance.xml");

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
  if (fs.existsSync(complianceXmlPath)) {
    return readComplianceXml(complianceXmlPath);
  }
  logger.error("Compliance file not found (CSV or XML)");
  throw new Error("Compliance file not found");
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

async function readComplianceXml(filePath: string): Promise<ComplianceEntry[]> {
  const xml = await fs.promises.readFile(filePath, "utf-8");
  const parsed = await parseStringPromise(xml);
  const parts = parsed?.ComplianceData?.Part ?? [];
  const entries: ComplianceEntry[] = parts.map((p: any) => ({
    part_number: String(p.PartNumber?.[0] ?? "").trim(),
    substance: String(p.Substance?.[0] ?? "").trim(),
    threshold_ppm: Number(p.ThresholdPPM?.[0] ?? 0),
  }));
  return entries;
}

export async function writeBomJson(data: BomData): Promise<void> {
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.writeFile(bomPath, JSON.stringify(data, null, 2));
}

export const paths = { dataDir, bomPath, complianceCsvPath, complianceXmlPath };


