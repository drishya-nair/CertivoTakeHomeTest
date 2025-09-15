import type { MergedComponent } from "@certivo/shared-types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import StatusIndicator from "./StatusIndicator";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ComplianceTableProps {
  rows: MergedComponent[];
  loading: boolean;
  error?: string;
}



const ErrorState = ({ error }: { error: string }) => (
  <div className="text-red-600">{error}</div>
);

export default function ComplianceTable({ rows, loading, error }: ComplianceTableProps) {
  const router = useRouter();
  
  // Memoized click handler for better performance
  const handleRowClick = useCallback((componentId: string) => {
    router.push(`/details/${encodeURIComponent(componentId)}`);
  }, [router]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, componentId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(componentId);
    }
  }, [handleRowClick]);

  // Early returns for loading and error states
  if (error) return <ErrorState error={error} />;
  if (loading) return <LoadingSpinner text="Loading..." className="text-sm text-gray-500" />;
  
  return (
    <div className="overflow-x-auto rounded border border-gray-200 dark:border-neutral-800">
      <div className="min-w-full">
        <table 
          className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800 text-sm" 
          role="table" 
          aria-label="Compliance data table"
        >
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Part</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Material</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Substance</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Mass</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Threshold (ppm)</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr 
              key={row.id} 
              className="hover:bg-gray-50 dark:hover:bg-neutral-900 cursor-pointer focus-within:bg-gray-50 dark:focus-within:bg-neutral-900" 
              onClick={() => handleRowClick(row.id)}
              onKeyDown={(e) => handleKeyDown(e, row.id)}
              tabIndex={0}
              role="button"
              aria-label={`View details for component ${row.id}`}
            >
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.id}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.material}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.substance ?? "—"}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.mass}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.threshold_ppm ?? "—"}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                <StatusIndicator status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
