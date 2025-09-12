import "dotenv/config";

/**
 * Canonical, validated environment shape for the API service.
 *
 * Notes:
 * - Keep defaults developer-friendly, but warn loudly if production uses demo defaults.
 * - Avoid importing the logger here to prevent a circular dependency; use console.warn instead.
 */
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

function parseCorsOrigin(raw: string | undefined): Env['CORS_ORIGIN'] {
  if (!raw || raw === '*') return '*';
  // Comma-separated list → string[]; trim whitespace
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw;
}

function parseLogLevel(value: string | undefined, fallback: string): string {
  const allowed = new Set(["error", "warn", "info", "http", "verbose", "debug", "silly"]);
  const level = (value || fallback).toLowerCase().trim();
  return allowed.has(level) ? level : fallback;
}

function sanitizePath(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function maskSecret(secret: string): string {
  if (!secret) return "<empty>";
  if (secret.length <= 4) return "*".repeat(secret.length);
  return `${secret.slice(0, 2)}***${secret.slice(-2)}`;
}

const computedEnv: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: (() => {
    const port = parseNumber(process.env.PORT, 4000);
    return port >= 1 && port <= 65535 ? port : 4000;
  })(),
  JWT_SECRET: (process.env.JWT_SECRET || "demo-secret").trim(),
  DEMO_USER: (process.env.DEMO_USER || "admin").trim(),
  DEMO_PASS: (process.env.DEMO_PASS || "password").trim(),
  LOG_LEVEL: parseLogLevel(process.env.LOG_LEVEL, "info"),
  DATA_DIR: sanitizePath(process.env.DATA_DIR),
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
};

// One-time, safe validation and warnings (no throws to preserve existing behavior)
(() => {
  const warnings: string[] = [];
  const isProduction = computedEnv.NODE_ENV === "production";

  if (computedEnv.PORT < 1 || computedEnv.PORT > 65535) {
    warnings.push(`PORT out of range; using fallback 4000`);
  }

  // Warn if using demo credentials or secrets in production
  if (isProduction) {
    if ((process.env.JWT_SECRET || "demo-secret").trim() === "demo-secret") {
      warnings.push(`JWT_SECRET uses demo default in production (masked: ${maskSecret(computedEnv.JWT_SECRET)})`);
    }
    if ((process.env.DEMO_USER || "admin").trim() === "admin") {
      warnings.push(`DEMO_USER uses demo default in production`);
    }
    if ((process.env.DEMO_PASS || "password").trim() === "password") {
      warnings.push(`DEMO_PASS uses demo default in production`);
    }
  }

  if (warnings.length > 0) {
    // Use console.warn to avoid logger/env circular dependency
    warnings.forEach((w) => console.warn(`[env] ${w}`));
  }
})();

export const env: Env = Object.freeze(computedEnv);

export default env;


