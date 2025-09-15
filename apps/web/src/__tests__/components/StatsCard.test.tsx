import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCard from '@/components/StatsCard';

describe('StatsCard Component', () => {
  const mockStats = {
    total: 100,
    compliant: 60,
    non: 30,
    unknown: 10
  };

  it('should render all statistics correctly', () => {
    render(<StatsCard stats={mockStats} />);
    
    expect(screen.getByText('100')).toBeInTheDocument(); // Total
    expect(screen.getByText('60')).toBeInTheDocument(); // Compliant
    expect(screen.getByText('30')).toBeInTheDocument(); // Non-Compliant
    expect(screen.getByText('10')).toBeInTheDocument(); // Unknown
  });

  it('should render correct labels', () => {
    render(<StatsCard stats={mockStats} />);
    
    expect(screen.getByText('Total Components')).toBeInTheDocument();
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    const zeroStats = {
      total: 0,
      compliant: 0,
      non: 0,
      unknown: 0
    };

    render(<StatsCard stats={zeroStats} />);
    
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('should handle large numbers', () => {
    const largeStats = {
      total: 999999,
      compliant: 500000,
      non: 300000,
      unknown: 199999
    };

    render(<StatsCard stats={largeStats} />);
    
    expect(screen.getByText('999999')).toBeInTheDocument();
    expect(screen.getByText('500000')).toBeInTheDocument();
    expect(screen.getByText('300000')).toBeInTheDocument();
    expect(screen.getByText('199999')).toBeInTheDocument();
  });

  it('should handle negative values gracefully', () => {
    const negativeStats = {
      total: -10,
      compliant: -5,
      non: -3,
      unknown: -2
    };

    render(<StatsCard stats={negativeStats} />);
    
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  it('should handle decimal values', () => {
    const decimalStats = {
      total: 100.5,
      compliant: 60.2,
      non: 30.1,
      unknown: 10.2
    };

    render(<StatsCard stats={decimalStats} />);
    
    expect(screen.getByText('100.5')).toBeInTheDocument();
    expect(screen.getByText('60.2')).toBeInTheDocument();
    expect(screen.getByText('30.1')).toBeInTheDocument();
    expect(screen.getByText('10.2')).toBeInTheDocument();
  });

  it('should render with correct styling classes', () => {
    render(<StatsCard stats={mockStats} />);
    
    const card = screen.getByText('Total Components').closest('div');
    expect(card).toHaveClass('bg-white', 'dark:bg-neutral-900', 'border', 'rounded-lg', 'p-4');
  });

  it('should render individual stat items with correct styling', () => {
    render(<StatsCard stats={mockStats} />);
    
    const totalItem = screen.getByText('Total Components').closest('div');
    expect(totalItem).toHaveClass('text-center');
    
    const compliantItem = screen.getByText('Compliant').closest('div');
    expect(compliantItem).toHaveClass('text-center');
  });

  it('should handle undefined stats gracefully', () => {
    render(<StatsCard stats={undefined as any} />);
    
    // Should not crash and should render empty or default values
    expect(screen.getByText('Total Components')).toBeInTheDocument();
  });

  it('should handle partial stats object', () => {
    const partialStats = {
      total: 50,
      compliant: 25
      // Missing non and unknown
    };

    render(<StatsCard stats={partialStats as any} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Compliant')).toBeInTheDocument();
  });

  it('should render with custom className when provided', () => {
    render(<StatsCard stats={mockStats} className="custom-stats-card" />);
    
    const card = screen.getByText('Total Components').closest('div');
    expect(card).toHaveClass('custom-stats-card');
  });

  it('should handle very large numbers with proper formatting', () => {
    const veryLargeStats = {
      total: 1000000,
      compliant: 600000,
      non: 300000,
      unknown: 100000
    };

    render(<StatsCard stats={veryLargeStats} />);
    
    expect(screen.getByText('1000000')).toBeInTheDocument();
    expect(screen.getByText('600000')).toBeInTheDocument();
    expect(screen.getByText('300000')).toBeInTheDocument();
    expect(screen.getByText('100000')).toBeInTheDocument();
  });

  it('should maintain consistent layout with different values', () => {
    const { rerender } = render(<StatsCard stats={mockStats} />);
    
    // Test with different values
    const newStats = {
      total: 1,
      compliant: 1,
      non: 0,
      unknown: 0
    };
    
    rerender(<StatsCard stats={newStats} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Total Components')).toBeInTheDocument();
  });

  it('should handle string numbers', () => {
    const stringStats = {
      total: '100' as any,
      compliant: '60' as any,
      non: '30' as any,
      unknown: '10' as any
    };

    render(<StatsCard stats={stringStats} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    render(<StatsCard stats={mockStats} />);
    
    const card = screen.getByText('Total Components').closest('div');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Compliance statistics');
  });

  it('should handle rapid re-renders with different stats', () => {
    const { rerender } = render(<StatsCard stats={mockStats} />);
    
    // Rapidly change stats
    for (let i = 0; i < 10; i++) {
      const newStats = {
        total: i * 10,
        compliant: i * 5,
        non: i * 3,
        unknown: i * 2
      };
      rerender(<StatsCard stats={newStats} />);
    }
    
    // Should still render correctly
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });
});
