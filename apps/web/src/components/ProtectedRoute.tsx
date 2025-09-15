"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "./LoginForm";
import Icon from "@/components/ui/Icon";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Loading spinner component for authentication check
const AuthLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Icon name="loading" size={32} className="animate-spin text-indigo-600 mx-auto" />
      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
