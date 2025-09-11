import "dotenv/config";

type Env = {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  DEMO_USER: string;
  DEMO_PASS: string;
  LOG_LEVEL: string;
  DATA_DIR?: string;
  CORS_ORIGIN: string | string[] | RegExp | (string | RegExp)[];
};

function parseNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 4000),
  JWT_SECRET: process.env.JWT_SECRET || "demo-secret",
  DEMO_USER: process.env.DEMO_USER || "admin",
  DEMO_PASS: process.env.DEMO_PASS || "password",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  DATA_DIR: process.env.DATA_DIR,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};

export default env;


