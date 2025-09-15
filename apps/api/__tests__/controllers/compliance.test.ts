import request from "supertest";
import fs from "fs";
import path from "path";
import { ensureDataDirForTests } from "../utils/dataDir";

// Set up test data directory and environment before importing the app
const dataDir = ensureDataDirForTests();

// Import app after setting up the test environment
import app from "../../src/app";

describe("Compliance Controller", () => {
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

  afterAll(async () => {
    // Clean up test data directory
    try {
      const testDataDir = ensureDataDirForTests();
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    // Ensure test data directory exists and set environment
    const testDataDir = ensureDataDirForTests();
    
    // Generate test compliance data dynamically
    const testComplianceData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nP-1002,BPA,500\nP-1003,Cadmium,200";
    
    await fs.promises.writeFile(
      path.join(testDataDir, "compliance.csv"),
      testComplianceData
    );
  });

  describe("GET /compliance", () => {
    it("should return compliance data with valid authentication", async () => {
      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      
      // Check structure of first entry
      const firstEntry = response.body[0];
      expect(firstEntry).toHaveProperty("part_number");
      expect(firstEntry).toHaveProperty("substance");
      expect(firstEntry).toHaveProperty("threshold_ppm");
      expect(typeof firstEntry.threshold_ppm).toBe("number");
    });

    it("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/compliance");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Missing or invalid Authorization header");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/compliance")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should handle missing compliance file", async () => {
      // Remove compliance file
      await fs.promises.unlink(path.join(dataDir, "compliance.csv"));

      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Compliance file not found");
    });

    it("should handle empty compliance file", async () => {
      // Create empty CSV file
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        ""
      );

      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "No valid compliance data found");
    });

    it("should handle CSV with invalid entries", async () => {
      // Create CSV with some invalid entries
      const invalidCsvData = "part_number,substance,threshold_ppm\nP-1001,Lead,1000\nInvalid Entry\nP-1003,Cadmium,200";
      
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        invalidCsvData
      );

      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should skip invalid entries and return valid ones
      expect(response.body.length).toBeLessThan(3);
    });

    it("should handle CSV with missing headers", async () => {
      // Create CSV without proper headers
      const invalidCsvData = "P-1001,Lead,1000\nP-1002,BPA,500";
      
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        invalidCsvData
      );

      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "No valid compliance data found");
    });

    it("should handle CSV with non-numeric threshold values", async () => {
      // Create CSV with non-numeric threshold
      const invalidCsvData = "part_number,substance,threshold_ppm\nP-1001,Lead,not_a_number";
      
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        invalidCsvData
      );

      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "No valid compliance data found");
    });

    it("should handle large CSV files efficiently", async () => {
      // Create a large CSV file
      const headers = "part_number,substance,threshold_ppm\n";
      const rows = Array.from({ length: 1000 }, (_, i) => 
        `P-${String(i).padStart(4, '0')},Substance${i},${Math.floor(Math.random() * 1000)}`
      ).join('\n');
      
      await fs.promises.writeFile(
        path.join(dataDir, "compliance.csv"),
        headers + rows
      );

      const start = Date.now();
      const response = await request(app)
        .get("/compliance")
        .set("Authorization", `Bearer ${authToken}`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1000);
      // Should process efficiently (less than 5 seconds for 1000 rows)
      expect(duration).toBeLessThan(5000);
    });
  });
});
