import { renderHook, act } from '@testing-library/react';
import { useComplianceStore } from '@/stores/complianceStore';
import { api } from '@/lib/api';
import { extractErrorMessage, logError } from '@/lib/errorHandling';

// Mock the API and error handling
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn()
  }
}));

jest.mock('@/lib/errorHandling', () => ({
  extractErrorMessage: jest.fn(),
  logError: jest.fn()
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockExtractErrorMessage = extractErrorMessage as jest.MockedFunction<typeof extractErrorMessage>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe('ComplianceStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useComplianceStore());
    
    expect(result.current.merged).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.filter).toBe('');
  });

  it('should fetch merged data successfully', async () => {
    const mockData = {
      product: 'Test Product',
      components: [
        {
          id: 'P-1001',
          substance: 'Lead',
          mass: '50g',
          threshold_ppm: 1000,
          status: 'Non-Compliant',
          material: 'Steel'
        }
      ]
    };

    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.merged).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(mockApi.get).toHaveBeenCalledWith('/merged');
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Network error');
    mockApi.get.mockRejectedValue(mockError);
    mockExtractErrorMessage.mockReturnValue('Failed to fetch data');

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.merged).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch data');
    expect(mockLogError).toHaveBeenCalledWith('ComplianceStore.fetchMerged', mockError);
  });

  it('should set loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockApi.get.mockReturnValue(promise as any);

    const { result } = renderHook(() => useComplianceStore());

    act(() => {
      result.current.fetchMerged();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();

    await act(async () => {
      resolvePromise!({ data: {} });
    });

    expect(result.current.loading).toBe(false);
  });

  it('should clear error when starting new fetch', async () => {
    // First fetch with error
    const mockError = new Error('Network error');
    mockApi.get.mockRejectedValueOnce(mockError);
    mockExtractErrorMessage.mockReturnValue('Failed to fetch data');

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.error).toBe('Failed to fetch data');

    // Second fetch (successful)
    const mockData = { product: 'Test Product', components: [] };
    mockApi.get.mockResolvedValue({ data: mockData });

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.merged).toEqual(mockData);
  });

  it('should set filter correctly', () => {
    const { result } = renderHook(() => useComplianceStore());

    act(() => {
      result.current.setFilter('test filter');
    });

    expect(result.current.filter).toBe('test filter');
  });

  it('should handle empty filter', () => {
    const { result } = renderHook(() => useComplianceStore());

    act(() => {
      result.current.setFilter('');
    });

    expect(result.current.filter).toBe('');
  });

  it('should handle special characters in filter', () => {
    const { result } = renderHook(() => useComplianceStore());

    const specialFilter = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
    act(() => {
      result.current.setFilter(specialFilter);
    });

    expect(result.current.filter).toBe(specialFilter);
  });

  it('should handle very long filter', () => {
    const { result } = renderHook(() => useComplianceStore());

    const longFilter = 'a'.repeat(1000);
    act(() => {
      result.current.setFilter(longFilter);
    });

    expect(result.current.filter).toBe(longFilter);
  });

  it('should handle API error with response data', async () => {
    const apiError = {
      response: {
        data: { message: 'Server error' }
      }
    };
    mockApi.get.mockRejectedValue(apiError);
    mockExtractErrorMessage.mockReturnValue('Server error');

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.error).toBe('Server error');
    expect(mockExtractErrorMessage).toHaveBeenCalledWith(apiError);
  });

  it('should handle API error without response data', async () => {
    const apiError = new Error('Network error');
    mockApi.get.mockRejectedValue(apiError);
    mockExtractErrorMessage.mockReturnValue('An unexpected error occurred');

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.error).toBe('An unexpected error occurred');
    expect(mockExtractErrorMessage).toHaveBeenCalledWith(apiError);
  });

  it('should handle multiple rapid filter changes', () => {
    const { result } = renderHook(() => useComplianceStore());

    act(() => {
      result.current.setFilter('filter1');
    });
    expect(result.current.filter).toBe('filter1');

    act(() => {
      result.current.setFilter('filter2');
    });
    expect(result.current.filter).toBe('filter2');

    act(() => {
      result.current.setFilter('filter3');
    });
    expect(result.current.filter).toBe('filter3');
  });

  it('should handle multiple rapid fetch calls', async () => {
    const mockData = { product: 'Test Product', components: [] };
    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useComplianceStore());

    // Start multiple fetches
    act(() => {
      result.current.fetchMerged();
      result.current.fetchMerged();
      result.current.fetchMerged();
    });

    await act(async () => {
      // Wait for all promises to resolve
      await Promise.all([
        result.current.fetchMerged(),
        result.current.fetchMerged(),
        result.current.fetchMerged()
      ]);
    });

    expect(result.current.merged).toEqual(mockData);
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch with undefined response data', async () => {
    mockApi.get.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.merged).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle fetch with null response data', async () => {
    mockApi.get.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useComplianceStore());

    await act(async () => {
      await result.current.fetchMerged();
    });

    expect(result.current.merged).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should maintain state across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useComplianceStore());
    const { result: result2 } = renderHook(() => useComplianceStore());

    act(() => {
      result1.current.setFilter('filter1');
    });

    expect(result1.current.filter).toBe('filter1');
    expect(result2.current.filter).toBe('filter1');
  });

  it('should handle concurrent fetch and filter operations', async () => {
    const mockData = { product: 'Test Product', components: [] };
    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useComplianceStore());

    act(() => {
      result.current.setFilter('test filter');
      result.current.fetchMerged();
    });

    expect(result.current.filter).toBe('test filter');
    expect(result.current.loading).toBe(true);

    await act(async () => {
      // Wait for fetch to complete
    });

    expect(result.current.merged).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.filter).toBe('test filter');
  });
});
