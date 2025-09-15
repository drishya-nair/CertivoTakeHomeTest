import path from "path";
import fs from "fs";

export function ensureDataDirForTests(): string {
  // Always use a test-specific data directory to avoid modifying production data
  const testDataDir = path.resolve(__dirname, "..", "..", "test-data");
  
  // Ensure the test data directory exists
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // Set the DATA_DIR environment variable so services use the test data directory
  process.env.DATA_DIR = testDataDir;
  
  return testDataDir;
}

// Simple test to ensure the utility function works
describe("dataDir utility", () => {
  it("should create test data directory and set environment variable", () => {
    const testDir = ensureDataDirForTests();
    expect(testDir).toContain("test-data");
    expect(process.env.DATA_DIR).toBe(testDir);
  });
});


