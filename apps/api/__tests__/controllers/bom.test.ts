import request from "supertest";
import fs from "fs";
import path from "path";
import { ensureDataDirForTests } from "../utils/dataDir";

// Set up test data directory and environment before importing the app
const dataDir = ensureDataDirForTests();

// Import app after setting up the test environment
import app from "../../src/app";

describe("BOM Controller", () => {
  let authToken: string;

  beforeAll(async () => {
    // Ensure test data directory exists
    ensureDataDirForTests();
    
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
      await fs.promises.rm(dataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    // Generate test BOM data dynamically
    const testBomData = {
      bom_id: "TEST-001",
      product_name: "Test Product",
      parts: [
        { part_number: "P-1001", material: "Steel", weight_g: 50 },
        { part_number: "P-1002", material: "Plastic", weight_g: 25 }
      ]
    };

    await fs.promises.writeFile(
      path.join(dataDir, "bom.json"),
      JSON.stringify(testBomData, null, 2)
    );
  });

  describe("GET /bom", () => {
    it("should return BOM data with valid authentication", async () => {
      const response = await request(app)
        .get("/bom")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("bom_id", "TEST-001");
      expect(response.body).toHaveProperty("product_name", "Test Product");
      expect(response.body).toHaveProperty("parts");
      expect(Array.isArray(response.body.parts)).toBe(true);
      expect(response.body.parts).toHaveLength(2);
    });

    it("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/bom");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Missing or invalid Authorization header");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/bom")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should handle missing BOM file", async () => {
      // Remove BOM file
      await fs.promises.unlink(path.join(dataDir, "bom.json"));

      const response = await request(app)
        .get("/bom")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "BOM file not found");
    });

    it("should handle malformed BOM JSON", async () => {
      // Write invalid JSON
      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        "invalid json content"
      );

      const response = await request(app)
        .get("/bom")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "Invalid BOM JSON format");
    });

    it("should handle invalid BOM data structure", async () => {
      // Write BOM with invalid structure
      const invalidBomData = {
        bom_id: "TEST-001",
        // Missing required fields
        parts: "not an array"
      };

      await fs.promises.writeFile(
        path.join(dataDir, "bom.json"),
        JSON.stringify(invalidBomData, null, 2)
      );

      const response = await request(app)
        .get("/bom")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message", "Invalid BOM data structure");
    });
  });
});
