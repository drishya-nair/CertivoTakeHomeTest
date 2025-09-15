"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, type LoginFormData, logValidationError } from "@/lib/validation";
import { DEMO_CREDENTIALS, ERROR_MESSAGES } from "@/lib/constants";
import { extractErrorMessage, logError } from "@/lib/errorHandling";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";


// Demo credentials component
const DemoCredentials = () => (
  <div className="bg-slate-700/30 rounded-lg p-4 mb-6 border border-slate-600/30">
    <div className="flex items-center mb-2">
      <Icon name="warning" size={16} className="text-yellow-400 mr-2" />
      <span className="text-yellow-400 text-xs font-medium">Demo Credentials</span>
    </div>
    <div className="text-xs text-slate-300 space-y-1">
      <div>Username: <span className="text-white font-mono">{DEMO_CREDENTIALS.USERNAME}</span></div>
      <div>Password: <span className="text-white font-mono">{DEMO_CREDENTIALS.PASSWORD}</span></div>
    </div>
  </div>
);

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
    <div className="flex items-center">
      <Icon name="warning" size={16} className="text-red-400 mr-2" />
      <span className="text-red-400 text-sm">{message}</span>
    </div>
  </div>
);


export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Log validation errors for debugging
  useEffect(() => {
    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message) {
        logValidationError(field, error.message);
      }
    });
  }, [errors]);

  // Handle form submission
  const onSubmit = useCallback(async (data: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      await login(data.username, data.password);
    } catch (error) {
      logError("LoginForm.onSubmit", error);
      setError(extractErrorMessage(error) || ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Icon name="lock" size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-300 text-sm">Sign in to access the compliance dashboard</p>
          </div>

          <DemoCredentials />

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.username?.message ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  {...register("username")}
                />
                {errors.username?.message && <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password?.message ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password?.message && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <LoadingSpinner text="Signing in..." className="text-white" /> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
