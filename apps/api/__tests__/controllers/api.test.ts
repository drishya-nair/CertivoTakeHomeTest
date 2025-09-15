import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../../src/app";
import { ensureDataDirForTests } from "../utils/dataDir";

const dataDir = ensureDataDirForTests();

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function login(): Promise<string> {
  const res = await request(app).post("/auth/login").send({ username: process.env.DEMO_USER || "admin", password: process.env.DEMO_PASS || "password" });
  return res.body.token as string;
}

beforeAll(async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.writeFile(
    path.join(dataDir, "bom.json"),
    JSON.stringify(
      {
        bom_id: "98765",
        product_name: "Smart Sensor",
        parts: [
          { part_number: "P-2001", material: "Copper", weight_g: 20 },
          { part_number: "P-2002", material: "Plastic", weight_g: 10 },
        ],
      },
      null,
      2
    )
  );
  await fs.promises.writeFile(
    path.join(dataDir, "compliance.csv"),
    "part_number,substance,threshold_ppm\nP-2001,Lead,1000\nP-2002,BPA,500\n"
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

describe("API", () => {
  it("authenticates and returns merged data", async () => {
    const token = await login();
    const res = await request(app).get("/merged").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.product).toBe("Smart Sensor");
    expect(Array.isArray(res.body.components)).toBe(true);
  });

  it("returns 401 for missing auth", async () => {
    const res = await request(app).get("/merged");
    expect(res.status).toBe(401);
  });
});


