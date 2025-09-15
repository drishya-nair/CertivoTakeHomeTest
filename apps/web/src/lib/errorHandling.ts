/**
 * Standardized error handling utilities
 * Provides consistent error handling patterns across the application
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Default error message for unknown errors
const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';

/**
 * Extracts error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  // Handle API errors with response data
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || DEFAULT_ERROR_MESSAGE;
  }
  
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Creates a standardized error object
 */
export function createError(message: string, status?: number, code?: string): ApiError {
  return { message, status, code };
}

/**
 * Logs errors consistently with context
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>): void {
  console.error(`[${context}]`, {
    error: extractErrorMessage(error),
    originalError: error,
    ...additionalInfo,
  });
}
