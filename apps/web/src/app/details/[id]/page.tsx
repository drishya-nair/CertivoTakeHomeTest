"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useComplianceStore } from "@/stores/complianceStore";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { MergedComponent } from "@certivo/shared-types";

// Field component for displaying key-value pairs
interface FieldProps {
  label: string;
  value: string | number | null;
  unit?: string;
}

function Field({ label, value, unit }: FieldProps) {
  const displayValue = (() => {
    if (!value) return "—";
    const unitSuffix = unit ? ` ${unit}` : "";
    return `${value}${unitSuffix}`;
  })();
  
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <p className="text-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
        {displayValue}
      </p>
    </div>
  );
}

// Status badge component
interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    "Compliant": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "Non-Compliant": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  
  const className = statusClasses[status as keyof typeof statusClasses] || 
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

  return (
    <span className={`px-4 py-3 rounded-lg text-lg font-semibold ${className}`}>
      {status}
    </span>
  );
}

// Not found component
function NotFoundComponent({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Icon name="warning" size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Component Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {ERROR_MESSAGES.COMPONENT_NOT_FOUND}
        </p>
        <Button onClick={onBack} className="inline-flex items-center gap-2">
          <Icon name="back" size={16} />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// Safely decode URI component with fallback
const safeDecodeURIComponent = (id: string): string => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { merged, loading, fetchMerged, error } = useComplianceStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !merged) {
      fetchMerged();
    }
  }, [isAuthenticated, authLoading, merged, fetchMerged]);

  // Find component with ID validation
  const component = useMemo((): MergedComponent | null => {
    if (!merged?.components || loading || authLoading) return null;
    
    const id = params.id;
    if (!id) return null;
    
    // Try multiple ID matching strategies
    const searchIds = [id, safeDecodeURIComponent(id), encodeURIComponent(id)];
    
    for (const searchId of searchIds) {
      const found = merged.components.find(c => c.id === searchId);
      if (found) return found;
    }
    
    return null;
  }, [merged?.components, params.id, loading, authLoading]);

  const handleBack = useCallback(() => router.back(), [router]);

  // Loading state
  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen p-6 md:p-10 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
          <div className="py-8">
            <LoadingSpinner size={32} text="Loading..." className="text-indigo-600" />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen p-6 md:p-10 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Icon name="warning" size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={handleBack} className="inline-flex items-center gap-2">
                <Icon name="back" size={16} />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-10 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
        <Button 
          variant="secondary"
          className="mb-6 inline-flex items-center gap-2"
          onClick={handleBack}
        >
          <Icon name="back" size={16} />
          Back to Dashboard
        </Button>
        
        <ErrorBoundary>
          {component ? (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {component.id}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Component Details</p>
              </div>

              {/* Main Content Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <Field label="Material" value={component.material} />
                      <Field label="Substance" value={component.substance} />
                      <Field label="Mass" value={component.mass} />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <Field 
                        label="Threshold" 
                        value={component.threshold_ppm} 
                        unit="ppm" 
                      />
                      
                      <div>
                        <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          Compliance Status
                        </h4>
                        <StatusBadge status={component.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Icon name="info" size={16} />
                    Compliance history is mocked in this demo.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NotFoundComponent onBack={handleBack} />
          )}
        </ErrorBoundary>
      </main>
    </ProtectedRoute>
  );
}


