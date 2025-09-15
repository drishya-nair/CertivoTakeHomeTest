import winston from "winston";

import env from "@/config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Configuration constants
const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] as const;
const DEFAULT_LOG_LEVEL = 'info';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const LOG_DIR = 'logs';

type LogLevel = typeof VALID_LOG_LEVELS[number];

/**
 * Validates log level and returns default if invalid
 * 
 * @param level - Log level to validate
 * @returns Validated log level
 */
function validateLogLevel(level: string): LogLevel {
  const normalizedLevel = level.toLowerCase().trim() as LogLevel;
  
  if (!VALID_LOG_LEVELS.includes(normalizedLevel)) {
    winston.warn(`[logger] Invalid log level '${level}', falling back to '${DEFAULT_LOG_LEVEL}'`);
    return DEFAULT_LOG_LEVEL;
  }
  
  return normalizedLevel;
}

// Format configurations
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

const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

/**
 * Creates Winston transports based on environment
 * 
 * @returns Array of configured transports
 */
function createTransports(): winston.transport[] {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  ];
  
  if (env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: `${LOG_DIR}/error.log`,
        level: 'error',
        format: prodFormat,
        maxsize: MAX_FILE_SIZE,
        maxFiles: MAX_FILES,
        handleExceptions: true,
        handleRejections: true,
      }),
      new winston.transports.File({
        filename: `${LOG_DIR}/combined.log`,
        format: prodFormat,
        maxsize: MAX_FILE_SIZE,
        maxFiles: MAX_FILES,
      })
    );
  }
  
  return transports;
}

// Create logger instance
export const logger = winston.createLogger({
  level: validateLogLevel(env.LOG_LEVEL),
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: createTransports(),
  exitOnError: false,
  silent: false,
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


