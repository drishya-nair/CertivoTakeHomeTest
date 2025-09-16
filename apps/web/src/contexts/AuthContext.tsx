"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { api, setAuthToken } from "@/lib/api";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for auth data
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// Helper functions for localStorage operations
const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const storeAuthData = (token: string, user: User) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userData = localStorage.getItem(AUTH_USER_KEY);

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setAuthToken(token);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function with proper error handling
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token } = response.data;
      const userData = { username };

      // Store auth data and update state
      storeAuthData(token, userData);
      setAuthToken(token);
      setUser(userData);
    } catch (error) {
      // Clear any partial state on error
      clearAuthData();
      setAuthToken();
      setUser(null);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setAuthToken();
    setUser(null);
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
