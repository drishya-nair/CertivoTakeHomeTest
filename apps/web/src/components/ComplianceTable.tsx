import type { MergedComponent } from "@certivo/shared-types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import StatusIndicator from "./StatusIndicator";

interface ComplianceTableProps {
  rows: MergedComponent[];
  loading: boolean;
  error?: string;
}

// Table cell components for consistent styling
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
    {children}
  </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
    {children}
  </td>
);

// Loading and error states
const LoadingState = () => (
  <div className="animate-pulse text-sm text-gray-500">Loading…</div>
);

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
  if (loading) return <LoadingState />;
  
  return (
    <div className="overflow-x-auto rounded border border-gray-200 dark:border-neutral-800">
      <table 
        className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800 text-sm" 
        role="table" 
        aria-label="Compliance data table"
      >
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            <Th>Part</Th>
            <Th>Material</Th>
            <Th>Substance</Th>
            <Th>Mass</Th>
            <Th>Threshold (ppm)</Th>
            <Th>Status</Th>
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
              <Td>{row.id}</Td>
              <Td>{row.material}</Td>
              <Td>{row.substance ?? "—"}</Td>
              <Td>{row.mass}</Td>
              <Td>{row.threshold_ppm ?? "—"}</Td>
              <Td>
                <StatusIndicator status={row.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
