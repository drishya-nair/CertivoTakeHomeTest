import { BomData } from "@certivo/shared-types";

import { readBomJson } from "@/lib/io/fileReader";

/**
 * Service for BOM (Bill of Materials) operations
 * 
 * Handles business logic related to BOM data retrieval and processing.
 */
export class BomService {
  /**
   * Retrieves BOM data
   * 
   * @returns Promise<BomData> - BOM data
   */
  static async getBomData(): Promise<BomData> {
    return await readBomJson();
  }
}
