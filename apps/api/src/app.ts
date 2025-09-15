import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import logger from "@/lib/logger";
import { errorHandler } from "@/middleware/errorHandler";
import apiRoutes from "@/routes";
import env, { getEnvWarnings } from "@/config/env";

// Error interface for type safety
/**
 * Extended Error interface with HTTP status code
 * 
 * Used for creating errors that can carry HTTP status codes
 * for proper error handling in Express middleware
 */
interface ErrorWithStatusCode extends Error {
  /** HTTP status code for the error */
  statusCode?: number;
}

/**
 * Creates and configures the Express application
 * 
 * Sets up middleware, routes, and error handling for the API server.
 * Includes security middleware, CORS, logging, and proper error handling.
 * 
 * @returns Configured Express application
 */
function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({ origin: env.CORS_ORIGIN }));
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  
  // Request logging middleware
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

  // Log any environment warnings at startup
  getEnvWarnings().forEach((msg) => logger.warn(msg));

  // API routes
  app.use("/", apiRoutes);

  // 404 handler for unmatched routes
  app.use((_req, _res, next) => {
    const error = new Error("Not Found") as ErrorWithStatusCode;
    error.statusCode = 404;
    next(error);
  });

  // Global error handling middleware
  app.use(errorHandler);

  return app;
}

// Create and export the configured application
const app = createApp();
export default app;
