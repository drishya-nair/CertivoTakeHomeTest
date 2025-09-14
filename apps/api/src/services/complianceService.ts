import { ComplianceEntry } from "@certivo/shared-types";
import { readCompliance } from "../lib/io/fileReader";

/**
 * Service for compliance operations
 * 
 * Handles business logic related to compliance data retrieval and processing.
 */
export class ComplianceService {
  /**
   * Retrieves compliance data
   * 
   * @returns Promise<ComplianceEntry[]> - Array of compliance entries
   */
  static async getComplianceData(): Promise<ComplianceEntry[]> {
    return await readCompliance();
  }
}
