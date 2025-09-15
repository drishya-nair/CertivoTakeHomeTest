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

// Test to ensure this file is recognized as a test file
describe("dataDir utility", () => {
  it("should export ensureDataDirForTests function", () => {
    expect(typeof ensureDataDirForTests).toBe("function");
  });
});


