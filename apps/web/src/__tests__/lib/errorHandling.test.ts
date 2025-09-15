import { extractErrorMessage, createError, logError } from '@/lib/errorHandling';

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Error Handling Utilities', () => {
  describe('extractErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Test error message');
      expect(extractErrorMessage(error)).toBe('Test error message');
    });

    it('should extract message from string error', () => {
      expect(extractErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error message' };
      expect(extractErrorMessage(error)).toBe('Object error message');
    });

    it('should extract message from API error with response data', () => {
      const apiError = {
        response: {
          data: {
            message: 'API error message'
          }
        }
      };
      expect(extractErrorMessage(apiError)).toBe('API error message');
    });

    it('should return default message for unknown error types', () => {
      expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
      expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(extractErrorMessage(123)).toBe('An unexpected error occurred');
      expect(extractErrorMessage({})).toBe('An unexpected error occurred');
    });

    it('should handle API error without response data', () => {
      const apiError = {
        response: {}
      };
      expect(extractErrorMessage(apiError)).toBe('An unexpected error occurred');
    });

    it('should handle API error with response but no data', () => {
      const apiError = {
        response: {
          data: {}
        }
      };
      expect(extractErrorMessage(apiError)).toBe('An unexpected error occurred');
    });

    it('should handle API error with response data but no message', () => {
      const apiError = {
        response: {
          data: {
            code: 'ERROR_CODE'
          }
        }
      };
      expect(extractErrorMessage(apiError)).toBe('An unexpected error occurred');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      expect(extractErrorMessage(error)).toBe('');
    });

    it('should handle object with non-string message', () => {
      const error = { message: 123 };
      expect(extractErrorMessage(error)).toBe('123');
    });

    it('should handle nested API error structure', () => {
      const apiError = {
        response: {
          data: {
            error: {
              message: 'Nested error message'
            }
          }
        }
      };
      expect(extractErrorMessage(apiError)).toBe('An unexpected error occurred');
    });
  });

  describe('createError', () => {
    it('should create error with message only', () => {
      const error = createError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('should create error with message and status', () => {
      const error = createError('Test error', 404);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.code).toBeUndefined();
    });

    it('should create error with message, status, and code', () => {
      const error = createError('Test error', 400, 'VALIDATION_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle empty message', () => {
      const error = createError('');
      expect(error.message).toBe('');
    });

    it('should handle zero status', () => {
      const error = createError('Test error', 0);
      expect(error.status).toBe(0);
    });

    it('should handle negative status', () => {
      const error = createError('Test error', -1);
      expect(error.status).toBe(-1);
    });

    it('should handle empty code', () => {
      const error = createError('Test error', 400, '');
      expect(error.code).toBe('');
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = 'TestComponent';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'Test error',
          originalError: error,
        }
      );
    });

    it('should log error with additional info', () => {
      const error = new Error('Test error');
      const context = 'TestComponent';
      const additionalInfo = { userId: '123', action: 'login' };
      
      logError(context, error, additionalInfo);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'Test error',
          originalError: error,
          userId: '123',
          action: 'login',
        }
      );
    });

    it('should log string error', () => {
      const error = 'String error';
      const context = 'TestComponent';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'String error',
          originalError: error,
        }
      );
    });

    it('should log object error', () => {
      const error = { message: 'Object error' };
      const context = 'TestComponent';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'Object error',
          originalError: error,
        }
      );
    });

    it('should log null error', () => {
      const error = null;
      const context = 'TestComponent';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'An unexpected error occurred',
          originalError: null,
        }
      );
    });

    it('should log undefined error', () => {
      const error = undefined;
      const context = 'TestComponent';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'An unexpected error occurred',
          originalError: undefined,
        }
      );
    });

    it('should log error with empty context', () => {
      const error = new Error('Test error');
      const context = '';
      
      logError(context, error);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'Test error',
          originalError: error,
        }
      );
    });

    it('should log error with complex additional info', () => {
      const error = new Error('Test error');
      const context = 'TestComponent';
      const additionalInfo = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        boolean: true,
        nullValue: null,
      };
      
      logError(context, error, additionalInfo);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'Test error',
          originalError: error,
          nested: { value: 'test' },
          array: [1, 2, 3],
          boolean: true,
          nullValue: null,
        }
      );
    });

    it('should handle API error in logError', () => {
      const apiError = {
        response: {
          data: {
            message: 'API error message'
          }
        }
      };
      const context = 'TestComponent';
      
      logError(context, apiError);
      
      expect(console.error).toHaveBeenCalledWith(
        `[${context}]`,
        {
          error: 'API error message',
          originalError: apiError,
        }
      );
    });

    it('should handle circular reference in additional info', () => {
      const error = new Error('Test error');
      const context = 'TestComponent';
      const circularRef: any = { name: 'test' };
      circularRef.self = circularRef;
      
      logError(context, error, { circularRef });
      
      // Should not throw error due to circular reference
      expect(console.error).toHaveBeenCalled();
    });
  });
});
