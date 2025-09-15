import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusIndicator from '@/components/StatusIndicator';

describe('StatusIndicator Component', () => {
  it('should render Compliant status with correct styling', () => {
    render(<StatusIndicator status="Compliant" />);
    
    const indicator = screen.getByText('Compliant');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-green-600', 'bg-green-100');
  });

  it('should render Non-Compliant status with correct styling', () => {
    render(<StatusIndicator status="Non-Compliant" />);
    
    const indicator = screen.getByText('Non-Compliant');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-red-600', 'bg-red-100');
  });

  it('should render Unknown status with correct styling', () => {
    render(<StatusIndicator status="Unknown" />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-gray-600', 'bg-gray-100');
  });

  it('should handle case variations correctly', () => {
    const { rerender } = render(<StatusIndicator status="Compliant" />);
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    
    rerender(<StatusIndicator status="Non-Compliant" />);
    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    
    rerender(<StatusIndicator status="Unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should render with custom size when provided', () => {
    render(<StatusIndicator status="Compliant" size="lg" />);
    
    const indicator = screen.getByText('Compliant');
    expect(indicator).toBeInTheDocument();
  });

  it('should handle empty string status', () => {
    render(<StatusIndicator status={"" as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    // Should default to Unknown styling
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('should handle null status', () => {
    render(<StatusIndicator status={null as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    // Should default to Unknown styling
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('should handle undefined status', () => {
    render(<StatusIndicator status={undefined as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    // Should default to Unknown styling
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('should handle custom status values', () => {
    render(<StatusIndicator status={"Custom Status" as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    // Should default to Unknown styling for unrecognized status
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('should render with proper accessibility attributes', () => {
    render(<StatusIndicator status="Compliant" />);
    
    const indicator = screen.getByText('Compliant');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label', 'Status: Compliant');
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<StatusIndicator status="Compliant" size="sm" />);
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    
    rerender(<StatusIndicator status="Compliant" size="md" />);
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    
    rerender(<StatusIndicator status="Compliant" size="lg" />);
    expect(screen.getByText('Compliant')).toBeInTheDocument();
  });

  it('should render different statuses in sequence', () => {
    const { rerender } = render(<StatusIndicator status="Compliant" />);
    expect(screen.getByText('Compliant')).toHaveClass('bg-green-500');
    
    rerender(<StatusIndicator status="Non-Compliant" />);
    expect(screen.getByText('Non-Compliant')).toHaveClass('bg-red-500');
    
    rerender(<StatusIndicator status="Unknown" />);
    expect(screen.getByText('Unknown')).toHaveClass('bg-gray-500');
  });

  it('should handle very long status text', () => {
    const longStatus = 'Very Long Status Text That Should Still Be Displayed Correctly';
    render(<StatusIndicator status={longStatus as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('should handle special characters in status', () => {
    const specialStatus = 'Status with Special Characters: !@#$%^&*()';
    render(<StatusIndicator status={specialStatus as any} />);
    
    const indicator = screen.getByText('Unknown');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-gray-500');
  });
});
