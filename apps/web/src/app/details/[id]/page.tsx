"use client";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useComplianceStore } from "@/stores/complianceStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ERROR_MESSAGES } from "@/lib/constants";

// Reusable field component to reduce repetition
interface FieldProps {
  label: string;
  value: string | number | null;
  unit?: string;
}

function Field({ label, value, unit }: FieldProps) {
  const displayValue = value ? `${value}${unit ? ` ${unit}` : ""}` : "—";
  
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

// Status badge component with proper styling
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

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { merged, loading, fetchMerged } = useComplianceStore();

  // Fetch data on mount
  useEffect(() => {
    fetchMerged();
  }, [fetchMerged]);

  // Find component with proper ID handling
  const component = useMemo(() => {
    if (!merged?.components) return null;
    
    const id = params.id;
    const decodedId = decodeURIComponent(id);
    
    return merged.components.find(c => c.id === id || c.id === decodedId);
  }, [merged?.components, params.id]);

  const handleBack = () => router.back();

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
          {loading ? (
            <div className="py-8">
              <LoadingSpinner size={32} text="Loading..." className="text-indigo-600" />
            </div>
          ) : component ? (
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          Compliance Status
                        </label>
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


