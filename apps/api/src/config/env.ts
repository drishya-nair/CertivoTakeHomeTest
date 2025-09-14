import "dotenv/config";

/**
 * Simple environment configuration for the API service
 */

/**
 * Environment configuration interface
 * 
 * Defines all required and optional environment variables
 * with their types and constraints
 */
interface Env {
  /** Node.js environment (development, production, test) */
  readonly NODE_ENV: string;
  /** Server port number */
  readonly PORT: number;
  /** JWT secret key for token signing */
  readonly JWT_SECRET: string;
  /** Demo username for authentication */
  readonly DEMO_USER: string;
  /** Demo password for authentication */
  readonly DEMO_PASS: string;
  /** Logging level (error, warn, info, http, verbose, debug, silly) */
  readonly LOG_LEVEL: string;
  /** Optional custom data directory path */
  readonly DATA_DIR?: string;
  /** CORS origin configuration */
  readonly CORS_ORIGIN: string;
}

// Parse environment variables with simple defaults
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

// Basic production warnings
if (env.NODE_ENV === "production") {
  if (env.JWT_SECRET === "demo-secret") {
    console.warn("[env] Using demo JWT_SECRET in production - this is insecure!");
  }
  if (env.CORS_ORIGIN === "*") {
    console.warn("[env] CORS_ORIGIN is set to '*' in production - consider restricting to specific domains");
  }
}

export { env };
export default env;


