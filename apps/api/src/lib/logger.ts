import winston from "winston";
import env from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Validates that the log level is supported by Winston
 */
function validateLogLevel(level: string): string {
  const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
  const normalizedLevel = level.toLowerCase().trim();
  
  if (!validLevels.includes(normalizedLevel)) {
    console.warn(`[logger] Invalid log level '${level}', falling back to 'info'`);
    return 'info';
  }
  
  return normalizedLevel;
}

/**
 * Creates a human-readable format for development
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
 */
const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

/**
 * Creates appropriate transports based on environment
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
  
  // File transport for production
  if (env.NODE_ENV === 'production') {
    const fileTransport = new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    });
    
    const combinedFileTransport = new winston.transports.File({
      filename: 'logs/combined.log',
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    });
    
    transports.push(fileTransport, combinedFileTransport);
  }
  
  return transports;
}

/**
 * Creates and configures the Winston logger instance
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

// Add helper methods for common logging patterns
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export default logger;


