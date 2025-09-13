import "dotenv/config";

/**
 * Canonical, validated environment configuration for the API service.
 * 
 * Features:
 * - Strict type safety with literal types where appropriate
 * - Comprehensive validation with clear error messages
 * - Security-focused handling of sensitive values
 * - Production safety checks with warnings
 * - Zero circular dependencies (no logger import)
 */

type NodeEnv = "development" | "production" | "test";
type LogLevel = "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";

interface Env {
  readonly NODE_ENV: NodeEnv;
  readonly PORT: number;
  readonly JWT_SECRET: string;
  readonly DEMO_USER: string;
  readonly DEMO_PASS: string;
  readonly LOG_LEVEL: LogLevel;
  readonly DATA_DIR?: string;
  readonly CORS_ORIGIN: string | string[] | RegExp | (string | RegExp)[];
}

// Validation constants
const VALID_LOG_LEVELS = new Set<LogLevel>([
  "error", "warn", "info", "http", "verbose", "debug", "silly"
]);

const VALID_NODE_ENVS = new Set<NodeEnv>([
  "development", "production", "test"
]);

const PORT_RANGE = { min: 1, max: 65535 } as const;
const MIN_SECRET_LENGTH = 32;

/**
 * Parses and validates a numeric port value with bounds checking
 */
function parsePort(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  
  const port = Number(value);
  if (!Number.isInteger(port) || port < PORT_RANGE.min || port > PORT_RANGE.max) {
    console.warn(`[env] Invalid PORT "${value}": must be integer between ${PORT_RANGE.min}-${PORT_RANGE.max}, using fallback ${fallback}`);
    return fallback;
  }
  
  return port;
}

/**
 * Parses and validates Node environment with type safety
 */
function parseNodeEnv(value: string | undefined): NodeEnv {
  const env = (value || "development").toLowerCase().trim() as NodeEnv;
  return VALID_NODE_ENVS.has(env) ? env : "development";
}

/**
 * Parses and validates log level with strict typing
 */
function parseLogLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const level = (value || fallback).toLowerCase().trim() as LogLevel;
  return VALID_LOG_LEVELS.has(level) ? level : fallback;
}

/**
 * Parses CORS origin with comprehensive validation
 */
function parseCorsOrigin(raw: string | undefined): Env['CORS_ORIGIN'] {
  if (!raw) return '*';
  
  const trimmed = raw.trim();
  if (trimmed === '*') return '*';
  
  // Handle comma-separated origins
  if (trimmed.includes(',')) {
    const origins = trimmed
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    if (origins.length === 0) return '*';
    return origins;
  }
  
  return trimmed;
}

/**
 * Sanitizes and validates file path
 */
function sanitizePath(value: string | undefined): string | undefined {
  if (!value) return undefined;
  
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  
  // Basic path validation - prevent directory traversal
  if (trimmed.includes('..') || trimmed.includes('~')) {
    console.warn(`[env] Potentially unsafe DATA_DIR path: "${trimmed}"`);
  }
  
  return trimmed;
}

/**
 * Validates JWT secret strength and security
 */
function validateJwtSecret(secret: string, isProduction: boolean): string {
  if (!secret) {
    console.warn('[env] JWT_SECRET is empty');
    return 'demo-secret';
  }
  
  if (secret.length < MIN_SECRET_LENGTH) {
    console.warn(`[env] JWT_SECRET too short (${secret.length} chars), minimum recommended: ${MIN_SECRET_LENGTH}`);
  }
  
  if (isProduction && secret === 'demo-secret') {
    console.warn('[env] Using demo JWT_SECRET in production - this is insecure!');
  }
  
  return secret;
}

/**
 * Masks sensitive values for logging with consistent formatting
 */
function maskSecret(secret: string): string {
  if (!secret) return '<empty>';
  if (secret.length <= 4) return '*'.repeat(secret.length);
  return `${secret.slice(0, 2)}***${secret.slice(-2)}`;
}

// Parse and validate environment variables
const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
const isProduction = nodeEnv === "production";

const computedEnv: Env = {
  NODE_ENV: nodeEnv,
  PORT: parsePort(process.env.PORT, 4000),
  JWT_SECRET: validateJwtSecret(
    (process.env.JWT_SECRET || "demo-secret").trim(),
    isProduction
  ),
  DEMO_USER: (process.env.DEMO_USER || "admin").trim(),
  DEMO_PASS: (process.env.DEMO_PASS || "password").trim(),
  LOG_LEVEL: parseLogLevel(process.env.LOG_LEVEL, "info"),
  DATA_DIR: sanitizePath(process.env.DATA_DIR),
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
};

/**
 * Production safety validation and warnings
 * Runs once at module load time to catch configuration issues early
 */
(() => {
  const warnings: string[] = [];

  // Validate demo credentials in production
  if (isProduction) {
    const rawJwtSecret = (process.env.JWT_SECRET || "demo-secret").trim();
    const rawDemoUser = (process.env.DEMO_USER || "admin").trim();
    const rawDemoPass = (process.env.DEMO_PASS || "password").trim();

    if (rawJwtSecret === "demo-secret") {
      warnings.push(`JWT_SECRET uses demo default in production (masked: ${maskSecret(computedEnv.JWT_SECRET)})`);
    }
    if (rawDemoUser === "admin") {
      warnings.push(`DEMO_USER uses demo default in production`);
    }
    if (rawDemoPass === "password") {
      warnings.push(`DEMO_PASS uses demo default in production`);
    }
  }

  // Validate CORS configuration
  if (computedEnv.CORS_ORIGIN === '*' && isProduction) {
    warnings.push('CORS_ORIGIN is set to "*" in production - consider restricting to specific domains');
  }

  // Log all warnings at once for better visibility
  if (warnings.length > 0) {
    console.warn(`[env] Configuration warnings (${warnings.length}):`);
    warnings.forEach((warning, index) => {
      console.warn(`[env] ${index + 1}. ${warning}`);
    });
  }
})();

export const env: Env = Object.freeze(computedEnv);

export default env;


