import { MergeService } from "../../src/services/mergeService";
import { BomData, ComplianceEntry } from "@certivo/shared-types";

// Mock the service dependencies
jest.mock("../../src/services/bomService", () => ({
  BomService: {
    getBomData: jest.fn()
  }
}));

jest.mock("../../src/services/complianceService", () => ({
  ComplianceService: {
    getComplianceData: jest.fn()
  }
}));

import { BomService } from "../../src/services/bomService";
import { ComplianceService } from "../../src/services/complianceService";

const mockBomService = BomService as jest.Mocked<typeof BomService>;
const mockComplianceService = ComplianceService as jest.Mocked<typeof ComplianceService>;

describe("MergeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMergedData", () => {
    it("should merge BOM and compliance data successfully", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 },
          { part_number: "P-1002", material: "Plastic", weight_g: 25 }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "Lead", threshold_ppm: 1000 },
        { part_number: "P-1002", substance: "BPA", threshold_ppm: 500 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result).toEqual({
        product: "Test Product",
        components: [
          {
            id: "P-1001",
            substance: "Lead",
            mass: "50g",
            threshold_ppm: 1000,
            status: "Non-Compliant",
            material: "Steel"
          },
          {
            id: "P-1002",
            substance: "BPA",
            mass: "25g",
            threshold_ppm: 500,
            status: "Compliant",
            material: "Plastic"
          }
        ]
      });
    });

    it("should handle components without compliance data", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 },
          { part_number: "P-UNKNOWN", material: "Unknown", weight_g: 30 }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "Lead", threshold_ppm: 1000 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result.components).toHaveLength(2);
      
      const unknownComponent = result.components.find(c => c.id === "P-UNKNOWN");
      expect(unknownComponent).toEqual({
        id: "P-UNKNOWN",
        substance: null,
        mass: "30g",
        threshold_ppm: null,
        status: "Unknown",
        material: "Unknown"
      });
    });

    it("should handle case-insensitive substance matching", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "BPA", threshold_ppm: 500 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result.components[0].status).toBe("Compliant");
    });

    it("should handle case-insensitive substance matching for non-BPA", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "lead", threshold_ppm: 1000 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result.components[0].status).toBe("Non-Compliant");
    });

    it("should handle whitespace in part numbers", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: " P-1001 ", material: "Steel", weight_g: 50 }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "BPA", threshold_ppm: 500 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result.components[0].id).toBe("P-1001");
      expect(result.components[0].status).toBe("Compliant");
    });

    it("should handle missing material field", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", weight_g: 50, material: undefined as any }
        ]
      };

      const mockComplianceData: ComplianceEntry[] = [
        { part_number: "P-1001", substance: "BPA", threshold_ppm: 500 }
      ];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      const result = await MergeService.getMergedData();

      expect(result.components[0].material).toBe("Unknown");
    });

    it("should throw error for invalid BOM data structure", async () => {
      const invalidBomData = {
        bom_id: "TEST-001",
        // Missing required fields
        parts: "not an array"
      };

      const mockComplianceData: ComplianceEntry[] = [];

      mockBomService.getBomData.mockResolvedValue(invalidBomData as any);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      await expect(MergeService.getMergedData()).rejects.toThrow("Invalid data structure");
    });

    it("should throw error for invalid compliance data structure", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: []
      };

      const invalidComplianceData = "not an array";

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(invalidComplianceData as any);

      await expect(MergeService.getMergedData()).rejects.toThrow("Invalid data structure");
    });

    it("should throw error for empty BOM parts", async () => {
      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: []
      };

      const mockComplianceData: ComplianceEntry[] = [];

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(mockComplianceData);

      await expect(MergeService.getMergedData()).rejects.toThrow("No components found after merging data");
    });

    it("should handle large datasets efficiently", async () => {
      const largeParts = Array.from({ length: 1000 }, (_, i) => ({
        part_number: `P-${String(i).padStart(4, '0')}`,
        material: "Steel",
        weight_g: Math.max(1, Math.floor(Math.random() * 100)) // Ensure weight_g is always positive
      }));

      const largeCompliance = Array.from({ length: 1000 }, (_, i) => ({
        part_number: `P-${String(i).padStart(4, '0')}`,
        substance: i % 2 === 0 ? "BPA" : "Lead",
        threshold_ppm: Math.max(0, Math.floor(Math.random() * 1000)) // Ensure threshold_ppm is non-negative
      }));

      const mockBomData: BomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: largeParts
      };

      mockBomService.getBomData.mockResolvedValue(mockBomData);
      mockComplianceService.getComplianceData.mockResolvedValue(largeCompliance);

      const start = Date.now();
      const result = await MergeService.getMergedData();
      const duration = Date.now() - start;

      expect(result.components).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
