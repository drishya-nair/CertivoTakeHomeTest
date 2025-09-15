import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws a non-Error object
const ThrowNonError = () => {
  throw 'String error';
};

// Component that throws null
const ThrowNull = () => {
  throw null;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should handle retry functionality', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should render children again after retry
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should handle multiple retries', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // First error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Retry
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(screen.getByText('No error')).toBeInTheDocument();

    // Throw error again
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Retry again
    fireEvent.click(retryButton);
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should handle non-Error objects', () => {
    render(
      <ErrorBoundary>
        <ThrowNonError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      'String error',
      expect.any(Object)
    );
  });

  it('should handle null errors', () => {
    render(
      <ErrorBoundary>
        <ThrowNull />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      null,
      expect.any(Object)
    );
  });

  it('should handle undefined errors', () => {
    const ThrowUndefined = () => {
      throw undefined;
    };

    render(
      <ErrorBoundary>
        <ThrowUndefined />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      undefined,
      expect.any(Object)
    );
  });

  it('should handle errors in nested components', () => {
    const NestedComponent = () => (
      <div>
        <div>Nested content</div>
        <ThrowError shouldThrow={true} />
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Nested content')).not.toBeInTheDocument();
  });

  it('should not catch errors in event handlers', () => {
    const ComponentWithErrorHandler = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };

      return (
        <div>
          <button onClick={handleClick}>Click me</button>
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <ComponentWithErrorHandler />
      </ErrorBoundary>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();

    // Error in event handler should not be caught by ErrorBoundary
    expect(() => {
      fireEvent.click(screen.getByText('Click me'));
    }).toThrow('Event handler error');
  });

  it('should handle errors in async operations', async () => {
    const AsyncErrorComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(false);

      React.useEffect(() => {
        if (shouldThrow) {
          throw new Error('Async error');
        }
      }, [shouldThrow]);

      return (
        <div>
          <button onClick={() => setShouldThrow(true)}>Trigger Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Trigger Error')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Trigger Error'));

    // Error should be caught
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should maintain state after retry', () => {
    const StatefulComponent = () => {
      const [count, setCount] = React.useState(0);
      const [shouldThrow, setShouldThrow] = React.useState(false);

      if (shouldThrow) {
        throw new Error('Test error');
      }

      return (
        <div>
          <div>Count: {count}</div>
          <button onClick={() => setCount(count + 1)}>Increment</button>
          <button onClick={() => setShouldThrow(true)}>Throw Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <StatefulComponent />
      </ErrorBoundary>
    );

    // Increment count
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();

    // Throw error
    fireEvent.click(screen.getByText('Throw Error'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Retry
    fireEvent.click(screen.getByText('Try Again'));

    // State should be reset (component re-mounted)
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('should handle multiple error boundaries', () => {
    const InnerErrorBoundary = ({ children }: { children: React.ReactNode }) => (
      <ErrorBoundary fallback={<div>Inner error</div>}>
        {children}
      </ErrorBoundary>
    );

    render(
      <ErrorBoundary fallback={<div>Outer error</div>}>
        <InnerErrorBoundary>
          <ThrowError shouldThrow={true} />
        </InnerErrorBoundary>
      </ErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText('Inner error')).toBeInTheDocument();
    expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
  });

  it('should handle errors in error boundary itself', () => {
    const FaultyErrorBoundary = class extends React.Component {
      render() {
        throw new Error('Error boundary error');
      }
    };

    // This should not crash the entire app
    expect(() => {
      render(
        <FaultyErrorBoundary>
          <ThrowError shouldThrow={true} />
        </FaultyErrorBoundary>
      );
    }).toThrow('Error boundary error');
  });
});
