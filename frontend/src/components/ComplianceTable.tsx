import type { MergedComponent } from "@/types";
import StatusPill from "./StatusPill";

interface ComplianceTableProps {
  rows: MergedComponent[];
  loading: boolean;
  error?: string;
}

export default function ComplianceTable({ rows, loading, error }: ComplianceTableProps) {
  if (error) return <div className="text-red-600">{error}</div>;
  if (loading) return <div className="animate-pulse text-sm text-gray-500">Loading…</div>;
  
  return (
    <div className="overflow-x-auto rounded border border-gray-200 dark:border-neutral-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800 text-sm">
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
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 cursor-pointer" onClick={() => window.location.assign(`/details/${encodeURIComponent(r.id)}`)}>
              <Td>{r.id}</Td>
              <Td>{r.material}</Td>
              <Td>{r.substance ?? "—"}</Td>
              <Td>{r.mass}</Td>
              <Td>{r.threshold_ppm ?? "—"}</Td>
              <Td>
                <StatusPill status={r.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{children}</td>;
}
