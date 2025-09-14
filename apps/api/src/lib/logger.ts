import winston from "winston";
import env from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Logger configuration constants
const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] as const;
const DEFAULT_LOG_LEVEL = 'info';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const LOG_DIR = 'logs';

// Type definitions for better type safety
type LogLevel = typeof VALID_LOG_LEVELS[number];

/**
 * Validates that the log level is supported by Winston
 * 
 * @param level - Log level to validate
 * @returns Validated log level or default if invalid
 */
function validateLogLevel(level: string): LogLevel {
  const normalizedLevel = level.toLowerCase().trim() as LogLevel;
  
  if (!VALID_LOG_LEVELS.includes(normalizedLevel)) {
    console.warn(`[logger] Invalid log level '${level}', falling back to '${DEFAULT_LOG_LEVEL}'`);
    return DEFAULT_LOG_LEVEL;
  }
  
  return normalizedLevel;
}

/**
 * Creates a human-readable format for development
 * Includes colorized output, timestamps, and stack traces
 */
const devFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  colorize({ all: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${ts} [${level}] ${message}${metaStr}${stackStr}`;
  })
);

/**
 * Creates a structured JSON format for production
 * Optimized for log aggregation and analysis
 */
const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

/**
 * Creates appropriate transports based on environment
 * 
 * @returns Array of Winston transports configured for the current environment
 */
function createTransports(): winston.transport[] {
  const transports: winston.transport[] = [];
  
  // Console transport for all environments
  const consoleTransport = new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
    handleExceptions: true,
    handleRejections: true,
  });
  
  transports.push(consoleTransport);
  
  // File transports for production
  if (env.NODE_ENV === 'production') {
    // Error log file
    const errorFileTransport = new winston.transports.File({
      filename: `${LOG_DIR}/error.log`,
      level: 'error',
      format: prodFormat,
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      handleExceptions: true,
      handleRejections: true,
    });
    
    // Combined log file
    const combinedFileTransport = new winston.transports.File({
      filename: `${LOG_DIR}/combined.log`,
      format: prodFormat,
      maxsize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
    });
    
    transports.push(errorFileTransport, combinedFileTransport);
  }
  
  return transports;
}

/**
 * Creates and configures the Winston logger instance
 * 
 * @returns Configured Winston logger instance
 */
function createLogger(): winston.Logger {
  const validatedLevel = validateLogLevel(env.LOG_LEVEL);
  
  const logger = winston.createLogger({
    level: validatedLevel,
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: createTransports(),
    exitOnError: false,
    silent: false,
  });
  
  return logger;
}

// Create the logger instance
export const logger = createLogger();

/**
 * Logs HTTP request information with structured data
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
 * Logs application errors with context information
 * 
 * @param error - Error object to log
 * @param context - Optional context data to include with the error
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


