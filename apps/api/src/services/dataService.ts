import { readBomJson, readCompliance } from "../lib/io/fileReader";
import { BomData, ComplianceEntry } from "@certivo/shared-types";
import HttpError from "../lib/httpError";

export class DataService {
  async getBomData(): Promise<BomData> {
    try {
      return await readBomJson();
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, "Failed to retrieve BOM data");
    }
  }

  async getComplianceData(): Promise<ComplianceEntry[]> {
    try {
      return await readCompliance();
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, "Failed to retrieve compliance data");
    }
  }

  async getMergedData(): Promise<{ bom: BomData; compliance: ComplianceEntry[] }> {
    try {
      const [bom, compliance] = await Promise.all([
        this.getBomData(),
        this.getComplianceData()
      ]);
      return { bom, compliance };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, "Failed to retrieve merged data");
    }
  }
}
