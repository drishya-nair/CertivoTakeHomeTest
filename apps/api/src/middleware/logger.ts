import winston from "winston";
import env from "../config/env";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts }) => {
  return `${ts} [${level}] ${message}`;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), logFormat),
  transports: [new winston.transports.Console({ format: combine(colorize(), timestamp(), logFormat) })],
});

export default logger;
