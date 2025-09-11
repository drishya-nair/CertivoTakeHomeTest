"use client";

import { useState, useEffect, useCallback } from "react";
import { useComplianceStore } from "@/stores/complianceStore";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const { login, logout } = useComplianceStore();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const handleLogin = useCallback(async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await login(username, password);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
    }
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [logout]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a stored token
        const token = localStorage.getItem("auth_token");
        if (token) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to check authentication status",
        });
      }
    };

    checkAuth();
  }, []);

  return {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
  };
}
