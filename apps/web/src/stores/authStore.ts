import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
          const token = data.token;

          set({
            token,
            isAuthenticated: true,
            user: username,
          });

          // Store token in localStorage for persistence
          localStorage.setItem("auth_token", token);
        } catch (error) {
          throw new Error("Login failed");
        }
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
        });

        // Remove token from localStorage
        localStorage.removeItem("auth_token");
      },

      setToken: (token: string) => {
        set({
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
