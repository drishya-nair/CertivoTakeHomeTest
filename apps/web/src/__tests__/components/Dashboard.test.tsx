import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useComplianceStore } from '@/stores/complianceStore';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import type { MergedResponse } from '@certivo/shared-types';

// Mock the stores and contexts
jest.mock('@/stores/complianceStore');
jest.mock('@/contexts/AuthContext');

const mockUseComplianceStore = useComplianceStore as jest.MockedFunction<typeof useComplianceStore>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Dashboard Component', () => {
  const mockLogout = jest.fn();
  const mockFetchMerged = jest.fn();
  const mockSetFilter = jest.fn();

  const mockMergedData: MergedResponse = {
    product: 'Test Product',
    components: [
      {
        id: 'P-1001',
        substance: 'Lead',
        mass: '50g',
        threshold_ppm: 1000,
        status: 'Non-Compliant',
        material: 'Steel'
      },
      {
        id: 'P-1002',
        substance: 'BPA',
        mass: '25g',
        threshold_ppm: 500,
        status: 'Compliant',
        material: 'Plastic'
      },
      {
        id: 'P-1003',
        substance: null,
        mass: '30g',
        threshold_ppm: null,
        status: 'Unknown',
        material: 'Aluminum'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
      isAuthenticated: true
    });

    mockUseComplianceStore.mockReturnValue({
      merged: mockMergedData,
      loading: false,
      error: undefined,
      filter: '',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });
  });

  it('should render dashboard header with title and logout button', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    render(<Dashboard />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should render search bar', () => {
    render(<Dashboard />);
    
    expect(screen.getByPlaceholderText('Search by part or status...')).toBeInTheDocument();
  });

  it('should call setFilter when search input changes', () => {
    render(<Dashboard />);
    
    const searchInput = screen.getByPlaceholderText('Search by part or status...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockSetFilter).toHaveBeenCalledWith('test search');
  });

  it('should render compliance table with all components', () => {
    render(<Dashboard />);
    
    // Check table headers
    expect(screen.getByText('Part')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Substance')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
    expect(screen.getByText('Threshold (ppm)')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check component data
    expect(screen.getByText('P-1001')).toBeInTheDocument();
    expect(screen.getByText('P-1002')).toBeInTheDocument();
    expect(screen.getByText('P-1003')).toBeInTheDocument();
  });

  it('should render stats card with correct counts', () => {
    render(<Dashboard />);
    
    // Check total count
    expect(screen.getByText('3')).toBeInTheDocument(); // Total components
    
    // Check individual status counts
    expect(screen.getByText('1')).toBeInTheDocument(); // Compliant
    expect(screen.getByText('1')).toBeInTheDocument(); // Non-Compliant
    expect(screen.getByText('1')).toBeInTheDocument(); // Unknown
  });

  it('should filter components based on search query', () => {
    // Mock filtered data
    const filteredData = {
      ...mockMergedData,
      components: [mockMergedData.components[0]] // Only P-1001
    };

    mockUseComplianceStore.mockReturnValue({
      merged: filteredData,
      loading: false,
      error: undefined,
      filter: 'P-1001',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });

    render(<Dashboard />);
    
    expect(screen.getByText('P-1001')).toBeInTheDocument();
    expect(screen.queryByText('P-1002')).not.toBeInTheDocument();
    expect(screen.queryByText('P-1003')).not.toBeInTheDocument();
  });

  it('should show loading state when data is loading', () => {
    mockUseComplianceStore.mockReturnValue({
      merged: undefined,
      loading: true,
      error: undefined,
      filter: '',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state when there is an error', () => {
    mockUseComplianceStore.mockReturnValue({
      merged: undefined,
      loading: false,
      error: 'Failed to fetch data',
      filter: '',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('should call fetchMerged on component mount', () => {
    render(<Dashboard />);
    
    expect(mockFetchMerged).toHaveBeenCalledTimes(1);
  });

  it('should handle empty components array', () => {
    const emptyData = {
      ...mockMergedData,
      components: []
    };

    mockUseComplianceStore.mockReturnValue({
      merged: emptyData,
      loading: false,
      error: undefined,
      filter: '',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });

    render(<Dashboard />);
    
    // Should show 0 for all counts
    expect(screen.getAllByText('0')).toHaveLength(4); // Total, Compliant, Non-Compliant, Unknown
  });

  it('should handle undefined merged data', () => {
    mockUseComplianceStore.mockReturnValue({
      merged: undefined,
      loading: false,
      error: undefined,
      filter: '',
      fetchMerged: mockFetchMerged,
      setFilter: mockSetFilter
    });

    render(<Dashboard />);
    
    // Should show 0 for all counts
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('should render theme toggle button', () => {
    render(<Dashboard />);
    
    // Theme toggle should be present (assuming it renders a button)
    const themeToggle = screen.getByRole('button', { name: /theme/i });
    expect(themeToggle).toBeInTheDocument();
  });

  it('should handle component click navigation', () => {
    render(<Dashboard />);
    
    // Click on a table row
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
    }
  });

  it('should handle keyboard navigation', () => {
    render(<Dashboard />);
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      // Test Enter key
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
      
      // Test Space key
      fireEvent.keyDown(firstRow, { key: ' ' });
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
    }
  });
});
