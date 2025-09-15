import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import logger from "@/lib/logger";
import { errorHandler } from "@/middleware/errorHandler";
import apiRoutes from "@/routes";
import env, { getEnvWarnings } from "@/config/env";

/**
 * Express application with security, logging, and error handling middleware
 * 
 * Configures the main API server with:
 * - Security headers via Helmet
 * - CORS configuration
 * - Request logging via Morgan
 * - JSON body parsing with size limits
 * - API routes
 * - 404 and global error handling
 */
const app = express();

// Security and CORS middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// Body parsing with size limit
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Log environment warnings at startup
getEnvWarnings().forEach((msg) => logger.warn(msg));

// API routes
app.use("/", apiRoutes);

// 404 handler for unmatched routes
app.use((_req, _res, next) => {
  const error = new Error("Not Found") as Error & { statusCode?: number };
  error.statusCode = 404;
  next(error);
});

// Global error handling
app.use(errorHandler);

export default app;
