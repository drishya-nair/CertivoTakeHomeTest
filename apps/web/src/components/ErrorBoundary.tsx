"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { ERROR_MESSAGES } from "@/lib/constants";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Default error UI component
const DefaultErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="p-6 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-lg">
    <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
      Something went wrong
    </h2>
    <p className="text-red-700 dark:text-red-300 mb-4">
      {ERROR_MESSAGES.UNEXPECTED_ERROR}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
