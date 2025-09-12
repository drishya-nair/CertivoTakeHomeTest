import { readBomJson, readCompliance } from "../lib/io/fileReader";
import { BomData, ComplianceEntry } from "@certivo/shared-types";

export class DataService {
  async getBomData(): Promise<BomData> {
    return await readBomJson();
  }

  async getComplianceData(): Promise<ComplianceEntry[]> {
    return await readCompliance();
  }

  async getMergedData(): Promise<{ bom: BomData; compliance: ComplianceEntry[] }> {
    const [bom, compliance] = await Promise.all([
      this.getBomData(),
      this.getComplianceData()
    ]);
    return { bom, compliance };
  }
}
