import http from "http";

import app from "./app";
import logger from "@/lib/logger";
import env from "@/config/env";

/**
 * HTTP server instance with Express application
 */
const server = http.createServer(app);

/**
 * Handles graceful shutdown of the server
 * 
 * Closes the server gracefully when receiving termination signals,
 * allowing existing connections to complete before shutting down.
 * Forces shutdown after 10 seconds if graceful close fails.
 */
function gracefulShutdown(): void {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  const port = env.PORT;
  
  server.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`);
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
    } else {
      logger.error('Server error:', error);
    }
    process.exit(1);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

export { server };
