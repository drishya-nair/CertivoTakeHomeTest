import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

describe('SearchBar Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render with custom placeholder', () => {
    const customPlaceholder = 'Search by part number...';
    render(<SearchBar value="" onChange={mockOnChange} placeholder={customPlaceholder} />);
    
    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    const testValue = 'test search';
    render(<SearchBar value={testValue} onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue(testValue);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('new search');
  });

  it('should call onChange with empty string when input is cleared', () => {
    render(<SearchBar value="existing value" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('existing value');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should handle special characters in input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const specialValue = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
    fireEvent.change(input, { target: { value: specialValue } });
    
    expect(mockOnChange).toHaveBeenCalledWith(specialValue);
  });

  it('should handle very long input values', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const longValue = 'a'.repeat(1000);
    fireEvent.change(input, { target: { value: longValue } });
    
    expect(mockOnChange).toHaveBeenCalledWith(longValue);
  });

  it('should render with custom className', () => {
    const customClass = 'custom-search-bar';
    render(<SearchBar value="" onChange={mockOnChange} className={customClass} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveClass(customClass);
  });

  it('should render with default className when no custom class provided', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'rounded-md');
  });

  it('should render with custom className', () => {
    const customClass = 'custom-search-bar';
    render(<SearchBar value="" onChange={mockOnChange} className={customClass} />);
    
    const container = screen.getByPlaceholderText(/search/i).closest('div');
    expect(container).toHaveClass(customClass);
  });

  it('should handle focus and blur events', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.focus(input);
    expect(input).toHaveFocus();
    
    fireEvent.blur(input);
    expect(input).not.toHaveFocus();
  });

  it('should handle keyboard events', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyUp(input, { key: 'Enter' });
    fireEvent.keyPress(input, { key: 'Enter' });
    
    // Should not crash and should handle events gracefully
    expect(input).toBeInTheDocument();
  });

  it('should handle controlled input correctly', () => {
    const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);
    
    let input = screen.getByDisplayValue('initial');
    expect(input).toHaveValue('initial');
    
    // Update the value prop
    rerender(<SearchBar value="updated" onChange={mockOnChange} />);
    input = screen.getByDisplayValue('updated');
    expect(input).toHaveValue('updated');
  });

  it('should handle controlled input correctly', () => {
    const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);
    
    let input = screen.getByDisplayValue('initial');
    expect(input).toHaveValue('initial');
    
    // Update the value prop
    rerender(<SearchBar value="updated" onChange={mockOnChange} />);
    input = screen.getByDisplayValue('updated');
    expect(input).toHaveValue('updated');
  });

  it('should render with proper accessibility attributes', () => {
    render(<SearchBar value="" onChange={mockOnChange} placeholder="Search components" />);
    
    const input = screen.getByPlaceholderText('Search components');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Search components');
  });

  it('should handle rapid input changes', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    // Rapidly change input value
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `test${i}` } });
    }
    
    expect(mockOnChange).toHaveBeenCalledTimes(10);
    expect(mockOnChange).toHaveBeenLastCalledWith('test9');
  });

  it('should handle empty string input', () => {
    render(<SearchBar value="initial" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('initial');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should handle whitespace-only input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: '   ' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('   ');
  });

  it('should handle newline characters in input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const valueWithNewlines = 'test\nsearch\r\nvalue';
    fireEvent.change(input, { target: { value: valueWithNewlines } });
    
    expect(mockOnChange).toHaveBeenCalledWith(valueWithNewlines);
  });

  it('should maintain focus after value changes', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    input.focus();
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(input).toHaveFocus();
  });

  it('should handle undefined onChange gracefully', () => {
    // Should not crash when onChange is undefined
    expect(() => {
      render(<SearchBar value="" onChange={undefined as any} />);
    }).not.toThrow();
  });
});
