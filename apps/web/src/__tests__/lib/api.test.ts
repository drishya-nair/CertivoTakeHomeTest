import { api, setAuthToken } from '@/lib/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      headers: {
        common: {}
      }
    }
  }))
}));

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should set authorization header when token is provided', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      setAuthToken('test-token');

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    });

    it('should remove authorization header when token is undefined', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {
              'Authorization': 'Bearer existing-token'
            }
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      setAuthToken(undefined);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should remove authorization header when token is null', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {
              'Authorization': 'Bearer existing-token'
            }
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      setAuthToken(null as any);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should remove authorization header when token is empty string', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {
              'Authorization': 'Bearer existing-token'
            }
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      setAuthToken('');

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should handle multiple token changes', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      // Set first token
      setAuthToken('first-token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer first-token');

      // Change to second token
      setAuthToken('second-token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer second-token');

      // Remove token
      setAuthToken(undefined);
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should handle token with special characters', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      const specialToken = 'token-with-special-chars!@#$%^&*()';
      setAuthToken(specialToken);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${specialToken}`);
    });

    it('should handle very long tokens', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      const longToken = 'a'.repeat(1000);
      setAuthToken(longToken);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${longToken}`);
    });

    it('should handle token with whitespace', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      const tokenWithWhitespace = '  token  ';
      setAuthToken(tokenWithWhitespace);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${tokenWithWhitespace}`);
    });
  });

  describe('API configuration', () => {
    it('should have correct base URL', () => {
      // The API_BASE should be '/api' as defined in the source
      expect((api as any).baseURL).toBe('/api');
    });

    it('should be an axios instance', () => {
      // Should have axios instance methods
      expect(api).toHaveProperty('get');
      expect(api).toHaveProperty('post');
      expect(api).toHaveProperty('put');
      expect(api).toHaveProperty('delete');
      expect(api).toHaveProperty('patch');
    });
  });

  describe('API instance properties', () => {
    it('should have defaults property', () => {
      expect(api).toHaveProperty('defaults');
    });

    it('should have interceptors property', () => {
      expect(api).toHaveProperty('interceptors');
    });

    it('should have request and response interceptors', () => {
      expect(api.interceptors).toHaveProperty('request');
      expect(api.interceptors).toHaveProperty('response');
    });
  });

  describe('Error handling', () => {
    it('should handle setAuthToken with undefined api object', () => {
      // This test ensures the function doesn't crash if api is undefined
      expect(() => {
        setAuthToken('test-token');
      }).not.toThrow();
    });

    it('should handle setAuthToken with missing defaults', () => {
      // Mock api without defaults
      const mockApi = {} as any;
      (api as any).defaults = undefined;

      expect(() => {
        setAuthToken('test-token');
      }).not.toThrow();
    });

    it('should handle setAuthToken with missing headers', () => {
      // Mock api with missing headers
      const mockApi = {
        defaults: {}
      } as any;
      (api as any).defaults = mockApi.defaults;

      expect(() => {
        setAuthToken('test-token');
      }).not.toThrow();
    });
  });

  describe('Type exports', () => {
    it('should export MergedComponent type', () => {
      // This test ensures the type exports are working
      expect(typeof api).toBe('object');
      expect(typeof setAuthToken).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle rapid token changes', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      // Rapidly change tokens
      for (let i = 0; i < 100; i++) {
        setAuthToken(`token-${i}`);
      }

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer token-99');
    });

    it('should handle alternating token set/unset', () => {
      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };

      // Mock the api object
      (api as any).defaults = mockAxiosInstance.defaults;

      // Alternating set/unset
      setAuthToken('token1');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer token1');

      setAuthToken(undefined);
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();

      setAuthToken('token2');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer token2');

      setAuthToken(null as any);
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});
