import request from "supertest";
import fs from "fs";
import path from "path";
import { ensureDataDirForTests } from "../utils/dataDir";

// Set up test data directory and environment before importing the app
const dataDir = ensureDataDirForTests();

// Import app after setting up the test environment
import app from "../../src/app";

describe("API Integration Tests", () => {
  let authToken: string;

  beforeAll(async () => {
    // Ensure test data directory exists and set environment
    const testDataDir = ensureDataDirForTests();
    
    // Generate test data dynamically
    const testBomData = {
      bom_id: "INTEGRATION-001",
      product_name: "Integration Test Product",
      parts: [
        { part_number: "P-1001", material: "Steel", weight_g: 50 },
        { part_number: "P-1002", material: "Plastic", weight_g: 25 },
        { part_number: "P-1003", material: "Aluminum", weight_g: 75 },
        { part_number: "P-1004", material: "Copper", weight_g: 30 }
      ]
    };

    const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nP-1002,BPA,500\nP-1003,Cadmium,200\nP-1004,Mercury,100";
    
    await fs.promises.writeFile(
      path.join(testDataDir, "bom.json"),
      JSON.stringify(testBomData, null, 2)
    );
    
    await fs.promises.writeFile(
      path.join(testDataDir, "compliance.csv"),
      testComplianceData
    );
  });

  afterAll(async () => {
    // Clean up test data directory
    try {
      await fs.promises.rm(dataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    // Login before each test
    const response = await request(app)
      .post("/auth/login")
      .send({
        username: "admin",
        password: "password"
      });
    authToken = response.body.token;
  });

  describe("Complete Authentication Flow", () => {
    it("should handle complete login -> access protected resource -> logout flow", async () => {
      // 1. Login
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          username: "admin",
          password: "password"
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("token");
      const token = loginResponse.body.token;

      // 2. Access protected resource
      const protectedResponse = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${token}`);

      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body).toHaveProperty("product");
      expect(protectedResponse.body).toHaveProperty("components");

      // 3. Refresh token
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${token}`);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty("token");
      // Note: JWT tokens with same payload and issued at same time will be identical
      // This is expected behavior, so we just verify we get a valid token
      expect(typeof refreshResponse.body.token).toBe("string");
      expect(refreshResponse.body.token.length).toBeGreaterThan(0);
    });
  });

  describe("Data Consistency Across Endpoints", () => {
    it("should return consistent data across all endpoints", async () => {
      // Get BOM data
      const bomResponse = await request(app)
        .get("/bom")
        .set("Authorization", `Bearer ${authToken}`);

      expect(bomResponse.status).toBe(200);
      const bomData = bomResponse.body;

      // Get compliance data
      const complianceResponse = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(complianceResponse.status).toBe(200);
      const complianceData = complianceResponse.body;

      // Get merged data
      const mergedResponse = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(mergedResponse.status).toBe(200);
      const mergedData = mergedResponse.body;

      // Verify data consistency
      expect(mergedData.product).toBe(bomData.product_name);
      expect(mergedData.components).toHaveLength(bomData.parts.length);
      expect(mergedData.components.length).toBeGreaterThan(0);

      // Verify each component has required fields
      mergedData.components.forEach((component: any) => {
        expect(component).toHaveProperty("id");
        expect(component).toHaveProperty("substance");
        expect(component).toHaveProperty("mass");
        expect(component).toHaveProperty("threshold_ppm");
        expect(component).toHaveProperty("status");
        expect(component).toHaveProperty("material");
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle authentication errors consistently", async () => {
      const endpoints = ["/bom", "/compliance", "/merged"];
      
      for (const endpoint of endpoints) {
        // Test without auth
        const noAuthResponse = await request(app).get(endpoint);
        expect(noAuthResponse.status).toBe(401);
        expect(noAuthResponse.body).toHaveProperty("message");

        // Test with invalid auth
        const invalidAuthResponse = await request(app)
          .get(endpoint)
          .set("Authorization", "Bearer invalid-token");
        expect(invalidAuthResponse.status).toBe(401);
        expect(invalidAuthResponse.body).toHaveProperty("message");
      }
    });

  it("should handle file system errors gracefully", async () => {
    const testDataDir = ensureDataDirForTests();
    const bomPath = path.join(testDataDir, "bom.json");
    
    // Remove BOM file if it exists
    if (fs.existsSync(bomPath)) {
      await fs.promises.unlink(bomPath);
    }

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "BOM file not found");

      // Restore BOM file
      const testBomData = {
        bom_id: "INTEGRATION-001",
        product_name: "Integration Test Product",
        parts: []
      };
      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        JSON.stringify(testBomData, null, 2)
      );
    });
  });

  describe("Performance Integration", () => {
    it("should handle concurrent requests efficiently", async () => {
      // Ensure test data is available
      const testDataDir = ensureDataDirForTests();
      const testBomData = {
        bom_id: "CONCURRENT-001",
        product_name: "Concurrent Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 },
          { part_number: "P-1002", material: "Plastic", weight_g: 25 }
        ]
      };
      const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nP-1002,BPA,500";
      
      await fs.promises.writeFile(
        path.join(testDataDir, "bom.json"),
        JSON.stringify(testBomData, null, 2)
      );
      await fs.promises.writeFile(
        path.join(testDataDir, "compliance.csv"),
        testComplianceData
      );

      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app)
          .get("/merged")
          .set("Authorization", `Bearer ${authToken}`)
      );

      const start = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const duration = Date.now() - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (5 seconds for 10 concurrent requests)
      expect(duration).toBeLessThan(5000);
    });

    it("should handle large data sets efficiently", async () => {
      const testDataDir = ensureDataDirForTests();
      
      // Create large BOM data
      const largeBomData = {
        bom_id: "LARGE-001",
        product_name: "Large Test Product",
        parts: Array.from({ length: 1000 }, (_, i) => ({
          part_number: `P-${String(i).padStart(4, '0')}`,
          material: "Steel",
          weight_g: Math.floor(Math.random() * 100) + 1 // Ensure weight is always > 0
        }))
      };

      const largeComplianceData = "part_number,substance,threshold_ppm\n" + 
        Array.from({ length: 1000 }, (_, i) => 
          `P-${String(i).padStart(4, '0')},Substance${i},${Math.floor(Math.random() * 1000)}`
        ).join('\n');

      await fs.promises.writeFile(
        path.join(testDataDir, "bom.json"),
        JSON.stringify(largeBomData, null, 2)
      );

      await fs.promises.writeFile(
        path.join(testDataDir, "compliance.csv"),
        "part_number,substance,threshold_ppm\n" + largeComplianceData
      );

      const start = Date.now();
      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(response.body.components).toHaveLength(1000);
      // Should complete within 10 seconds for 1000 components
      expect(duration).toBeLessThan(10000);
    });
  });

  describe("Data Validation Integration", () => {
    it("should validate data integrity across the entire pipeline", async () => {
      // Ensure test data is available
      const testDataDir = ensureDataDirForTests();
      const testBomData = {
        bom_id: "VALIDATION-001",
        product_name: "Validation Test Product",
        parts: [
          { part_number: "P-1001", material: "Steel", weight_g: 50 },
          { part_number: "P-1002", material: "Plastic", weight_g: 25 }
        ]
      };
      const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nP-1002,BPA,500";
      
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
      const mergedData = response.body;

      // Verify product name is not empty
      expect(mergedData.product).toBeTruthy();
      expect(typeof mergedData.product).toBe("string");

      // Verify components array
      expect(Array.isArray(mergedData.components)).toBe(true);
      expect(mergedData.components.length).toBeGreaterThan(0);

      // Verify each component's data integrity
      mergedData.components.forEach((component: any) => {
        // ID should be non-empty string
        expect(component.id).toBeTruthy();
        expect(typeof component.id).toBe("string");

        // Mass should be in correct format (number + 'g')
        expect(component.mass).toMatch(/^\d+g$/);

        // Status should be one of the valid values
        expect(['Compliant', 'Non-Compliant', 'Unknown']).toContain(component.status);

        // If substance exists, it should be a string
        if (component.substance !== null) {
          expect(typeof component.substance).toBe("string");
        }

        // If threshold exists, it should be a number
        if (component.threshold_ppm !== null) {
          expect(typeof component.threshold_ppm).toBe("number");
          expect(component.threshold_ppm).toBeGreaterThanOrEqual(0);
        }

        // Material should be a string
        expect(typeof component.material).toBe("string");
        expect(component.material).toBeTruthy();
      });
    });
  });

  describe("Security Integration", () => {
    it("should handle malicious input safely", async () => {
      const testDataDir = ensureDataDirForTests();
      
      // Test with potentially malicious BOM data
      const maliciousBomData = {
        bom_id: "MALICIOUS-001",
        product_name: "Malicious Test Product",
        parts: [
          { 
            part_number: "<script>alert('xss')</script>", 
            material: "Steel", 
            weight_g: 50 
          },
          { 
            part_number: "P-1002", 
            material: "'; DROP TABLE parts; --", 
            weight_g: 25 
          }
        ]
      };

      await fs.promises.writeFile(
        path.join(testDataDir, "bom.json"),
        JSON.stringify(maliciousBomData, null, 2)
      );

      const response = await request(app)
        .get("/merged")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Data should be returned as-is without execution
      const component = response.body.components.find((c: any) => c.id.includes('<script>'));
      expect(component).toBeDefined();
      expect(component.id).toBe("<script>alert('xss')</script>");
    });

  });
});
