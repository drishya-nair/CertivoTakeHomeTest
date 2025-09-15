import winston from "winston";
import fs from "fs";

import env from "@/config/env";

// Simple logger configuration appropriate for small projects
const isProduction = env.NODE_ENV === 'production';
const logLevel = env.LOG_LEVEL || 'info';

// Ensure logs directory exists in production
if (isProduction && !fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

// Development format: colored console output
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

// Production format: JSON with file rotation
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports based on environment
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
    level: logLevel,
  })
];

// Add file logging in production
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: prodFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

/**
 * Logs HTTP request information
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param responseTime - Response time in milliseconds
 */
export const logRequest = (req: any, res: any, responseTime: number): void => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

/**
 * Logs application errors with context
 * 
 * @param error - Error object to log
 * @param context - Optional context data
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export default logger;


