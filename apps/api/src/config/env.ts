import "dotenv/config";

/**
 * Environment configuration for the API service
 */
interface Env {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly JWT_SECRET: string;
  readonly DEMO_USER: string;
  readonly DEMO_PASS: string;
  readonly LOG_LEVEL: string;
  readonly DATA_DIR?: string;
  readonly CORS_ORIGIN: string;
}

/**
 * Environment configuration with defaults
 */
const env: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "demo-secret",
  DEMO_USER: process.env.DEMO_USER || "admin",
  DEMO_PASS: process.env.DEMO_PASS || "password",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  DATA_DIR: process.env.DATA_DIR,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};

/**
 * Returns production environment warnings
 * @returns Array of warning messages for production configuration issues
 */
export function getEnvWarnings(): string[] {
  const warnings: string[] = [];
  if (env.NODE_ENV === "production") {
    if (env.JWT_SECRET === "demo-secret") {
      warnings.push("[env] Using demo JWT_SECRET in production - this is insecure!");
    }
    if (env.CORS_ORIGIN === "*") {
      warnings.push("[env] CORS_ORIGIN is set to '*' in production - consider restricting to specific domains");
    }
  }
  return warnings;
}

export { env };
export default env;


