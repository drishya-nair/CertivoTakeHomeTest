import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComplianceTable from '@/components/ComplianceTable';
import type { MergedComponent } from '@certivo/shared-types';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ComplianceTable Component', () => {
  const mockComponents: MergedComponent[] = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table headers correctly', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    expect(screen.getByText('Part')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Substance')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
    expect(screen.getByText('Threshold (ppm)')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should render all component data correctly', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    // Check first component (P-1001)
    expect(screen.getByText('P-1001')).toBeInTheDocument();
    expect(screen.getByText('Steel')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('50g')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    
    // Check second component (P-1002)
    expect(screen.getByText('P-1002')).toBeInTheDocument();
    expect(screen.getByText('Plastic')).toBeInTheDocument();
    expect(screen.getByText('BPA')).toBeInTheDocument();
    expect(screen.getByText('25g')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    
    // Check third component (P-1003)
    expect(screen.getByText('P-1003')).toBeInTheDocument();
    expect(screen.getByText('Aluminum')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // null substance
    expect(screen.getByText('30g')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // null threshold
  });

  it('should show loading state when loading is true', () => {
    render(<ComplianceTable rows={[]} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state when error is provided', () => {
    const errorMessage = 'Failed to load data';
    render(<ComplianceTable rows={[]} loading={false} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle empty rows array', () => {
    render(<ComplianceTable rows={[]} loading={false} />);
    
    // Should render table structure but no data rows
    expect(screen.getByText('Part')).toBeInTheDocument();
    expect(screen.queryByText('P-1001')).not.toBeInTheDocument();
  });

  it('should navigate to details page when row is clicked', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
    }
  });

  it('should navigate to details page when Enter key is pressed', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
    }
  });

  it('should navigate to details page when Space key is pressed', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: ' ' });
      expect(mockPush).toHaveBeenCalledWith('/details/P-1001');
    }
  });

  it('should not navigate when other keys are pressed', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: 'Tab' });
      expect(mockPush).not.toHaveBeenCalled();
    }
  });

  it('should handle different component statuses', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    // Check that status indicators are rendered
    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle null values gracefully', () => {
    const componentsWithNulls: MergedComponent[] = [
      {
        id: 'P-1001',
        substance: null,
        mass: '50g',
        threshold_ppm: null,
        status: 'Unknown',
        material: 'Steel'
      }
    ];

    render(<ComplianceTable rows={componentsWithNulls} loading={false} />);
    
    // Should display dashes for null values
    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(2); // substance and threshold_ppm
  });

  it('should have proper accessibility attributes', () => {
    render(<ComplianceTable rows={mockComponents} loading={false} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Compliance data table');
    
    const firstRow = screen.getByText('P-1001').closest('tr');
    expect(firstRow).toHaveAttribute('role', 'button');
    expect(firstRow).toHaveAttribute('tabIndex', '0');
    expect(firstRow).toHaveAttribute('aria-label', 'View details for component P-1001');
  });

  it('should handle large datasets efficiently', () => {
    const largeComponents = Array.from({ length: 1000 }, (_, i) => ({
      id: `P-${String(i).padStart(4, '0')}`,
      substance: i % 2 === 0 ? 'BPA' : 'Lead',
      mass: `${i}g`,
      threshold_ppm: i * 10,
      status: (i % 2 === 0 ? 'Compliant' : 'Non-Compliant') as 'Compliant' | 'Non-Compliant' | 'Unknown',
      material: 'Steel'
    }));

    const start = Date.now();
    render(<ComplianceTable rows={largeComponents} loading={false} />);
    const duration = Date.now() - start;

    // Should render efficiently (less than 1 second for 1000 rows)
    expect(duration).toBeLessThan(1000);
    expect(screen.getByText('P-0000')).toBeInTheDocument();
    expect(screen.getByText('P-0999')).toBeInTheDocument();
  });

  it('should prioritize error state over loading state', () => {
    const errorMessage = 'Network error';
    render(<ComplianceTable rows={[]} loading={true} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should handle components with missing material', () => {
    const componentsWithMissingMaterial: MergedComponent[] = [
      {
        id: 'P-1001',
        substance: 'Lead',
        mass: '50g',
        threshold_ppm: 1000,
        status: 'Non-Compliant',
        material: 'Unknown' // This would be set by the service
      }
    ];

    render(<ComplianceTable rows={componentsWithMissingMaterial} loading={false} />);
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
