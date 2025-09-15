"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "./LoginForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} text="Loading..." className="text-indigo-600" />
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
