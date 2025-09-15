import request from "supertest";
import fs from "fs";
import path from "path";
import { ensureDataDirForTests } from "../utils/dataDir";

// Set up test data directory and environment before importing the app
const dataDir = ensureDataDirForTests();

// Import app after setting up the test environment
import app from "../../src/app";

describe("Merged Controller", () => {
  let authToken: string;

  beforeAll(async () => {
    // Ensure test data directory exists
    await ensureDataDirForTests();
    
    // Login to get auth token
    const response = await request(app)
      .post("/auth/login")
      .send({
        username: "admin",
        password: "password"
      });
    authToken = response.body.token;
  });

  beforeEach(async () => {
    // Ensure test data directory exists and set environment
    const testDataDir = ensureDataDirForTests();
    
    // Create test BOM data
    const testBomData = {
      bom_id: "TEST-001",
      product_name: "Test Product",
      parts: [
        { part_number: "P-1001", material: "Steel", weight_g: 50 },
        { part_number: "P-1002", material: "Plastic", weight_g: 25 },
        { part_number: "P-1003", material: "Aluminum", weight_g: 75 }
      ]
    };

    // Create test compliance data
    const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nP-1002,BPA,500\nP-1003,Cadmium,200";
    
    await fs.promises.writeFile(
      path.join(testDataDir, "bom.json"),
      JSON.stringify(testBomData, null, 2)
    );
    
    await fs.promises.writeFile(
      path.join(testDataDir, "compliance.csv"),
      testComplianceData
    );
  });

  describe("GET /merged", () => {
    it("should return merged data with valid authentication", async () => {
      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("product", "Test Product");
      expect(response.body).toHaveProperty("components");
      expect(Array.isArray(response.body.components)).toBe(true);
      expect(response.body.components).toHaveLength(3);
      
      // Check structure of first component
      const firstComponent = response.body.components[0];
      expect(firstComponent).toHaveProperty("id");
      expect(firstComponent).toHaveProperty("substance");
      expect(firstComponent).toHaveProperty("mass");
      expect(firstComponent).toHaveProperty("threshold_ppm");
      expect(firstComponent).toHaveProperty("status");
      expect(firstComponent).toHaveProperty("material");
    });

    it("should correctly merge BOM and compliance data", async () => {
      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const components = response.body.components;
      
      // Find P-1001 (should have Lead substance)
      const p1001 = components.find((c: any) => c.id === "P-1001");
      expect(p1001).toBeDefined();
      expect(p1001.substance).toBe("Lead");
      expect(p1001.threshold_ppm).toBe(1000);
      expect(p1001.status).toBe("Non-Compliant"); // Lead is not BPA
      expect(p1001.mass).toBe("50g");
      
      // Find P-1002 (should have BPA substance)
      const p1002 = components.find((c: any) => c.id === "P-1002");
      expect(p1002).toBeDefined();
      expect(p1002.substance).toBe("BPA");
      expect(p1002.threshold_ppm).toBe(500);
      expect(p1002.status).toBe("Compliant"); // BPA is allowed
      expect(p1002.mass).toBe("25g");
      
      // Find P-1003 (should have Cadmium substance)
      const p1003 = components.find((c: any) => c.id === "P-1003");
      expect(p1003).toBeDefined();
      expect(p1003.substance).toBe("Cadmium");
      expect(p1003.threshold_ppm).toBe(200);
      expect(p1003.status).toBe("Non-Compliant"); // Cadmium is not BPA
      expect(p1003.mass).toBe("75g");
    });

    it("should handle components without compliance data", async () => {
      // Create BOM with extra part not in compliance data
      const testBomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 },
          { part_number: "P-UNKNOWN", material: "Unknown", weight_g: 30 }
        ]
      };

      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        JSON.stringify(testBomData, null, 2)
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const components = response.body.components;
      const unknownComponent = components.find((c: any) => c.id === "P-UNKNOWN");
      
      expect(unknownComponent).toBeDefined();
      expect(unknownComponent.substance).toBeNull();
      expect(unknownComponent.threshold_ppm).toBeNull();
      expect(unknownComponent.status).toBe("Unknown");
      expect(unknownComponent.mass).toBe("30g");
    });

    it("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/merged");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Missing or invalid Authorization header");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/merged")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should handle missing BOM file", async () => {
      await fs.promises.unlink(path.join(dataDir, "bom.json"));

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "BOM file not found");
    });

    it("should handle missing compliance file", async () => {
      await fs.promises.unlink(path.join(dataDir, "compliance.csv"));

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Compliance file not found");
    });

    it("should handle empty BOM parts array", async () => {
      const emptyBomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: []
      };

      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        JSON.stringify(emptyBomData, null, 2)
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "No components found after merging data");
    });

    it("should handle malformed BOM JSON", async () => {
      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        "invalid json content"
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "Invalid BOM JSON format");
    });

    it("should handle malformed compliance CSV", async () => {
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        "invalid csv content"
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "No valid compliance data found");
    });

    it("should handle case-insensitive part number matching", async () => {
      // Create BOM with lowercase part numbers
      const testBomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: "p-1001", material: "Steel", weight_g: 50 }
        ]
      };

      // Create compliance data with uppercase part numbers
      const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000";
      
      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        JSON.stringify(testBomData, null, 2)
      );
      
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        testComplianceData
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const components = response.body.components;
      const component = components.find((c: any) => c.id === "p-1001");
      
      expect(component).toBeDefined();
      expect(component.substance).toBe("Lead");
      expect(component.status).toBe("Non-Compliant");
    });

    it("should handle whitespace in part numbers", async () => {
      const testDataDir = ensureDataDirForTests();
      
      // Create BOM with part numbers containing whitespace
      const testBomData = {
        bom_id: "TEST-001",
        product_name: "Test Product",
        parts: [
          { part_number: " P-1001 ", material: "Steel", weight_g: 50 }
        ]
      };

      // Create compliance data with part numbers containing whitespace
      const testComplianceData = "part_number,substance,threshold_ppm\n P-1001 ,Lead,1000";
      
      await fs.promises.writeFile(
        path.join(testDataDir, "bom.json"),
        JSON.stringify(testBomData, null, 2)
      );
      
      await fs.promises.writeFile(
        path.join(testDataDir, "compliance.csv"),
        testComplianceData
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const components = response.body.components;
      const component = components.find((c: any) => c.id === "P-1001");
      
      expect(component).toBeDefined();
      expect(component.substance).toBe("Lead");
      expect(component.status).toBe("Non-Compliant");
    });
  });
});
