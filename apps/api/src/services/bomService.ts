import { BomData } from "@certivo/shared-types";
import { readBomJson } from "@/lib/io/fileReader";

/**
 * Service for BOM (Bill of Materials) operations
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
