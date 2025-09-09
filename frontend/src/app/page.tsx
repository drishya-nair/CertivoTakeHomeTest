"use client";
import { useEffect, useMemo, useState } from "react";
import { useComplianceStore } from "@/stores/complianceStore";
import type { MergedComponent } from "@/utils/api";
import ComplianceChart from "@/components/ComplianceChart";

export default function Home() {
  const { merged, loading, error, fetchMerged, login, filter, setFilter } = useComplianceStore();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await login(process.env.NEXT_PUBLIC_DEMO_USER || "admin", process.env.NEXT_PUBLIC_DEMO_PASS || "password");
        setAuthed(true);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [login]);

  useEffect(() => {
    if (authed) fetchMerged();
  }, [authed, fetchMerged]);

  const filtered = useMemo<MergedComponent[]>(() => {
    const q = filter.trim().toLowerCase();
    if (!merged) return [];
    if (!q) return merged.components;
    return merged.components.filter((c) => c.id.toLowerCase().includes(q) || c.status.toLowerCase().includes(q));
  }, [merged, filter]);

  const stats = useMemo(() => {
    const total = merged?.components.length || 0;
    const compliant = merged?.components.filter((c) => c.status === "Compliant").length || 0;
    const non = merged?.components.filter((c) => c.status === "Non-Compliant").length || 0;
    const unknown = total - compliant - non;
    return { total, compliant, non, unknown };
  }, [merged]);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Compliance Dashboard</h1>
        <DarkModeToggle />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by part or status..."
              className="w-full rounded border border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2"
            />
          </div>
          <Table loading={loading} error={error} rows={filtered} />
        </div>
        <div className="space-y-4">
          <StatsCard stats={stats} />
          <ComplianceChart compliant={stats.compliant} non={stats.non} unknown={stats.unknown} />
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = status === "Compliant" ? "bg-green-500" : status === "Non-Compliant" ? "bg-red-500" : "bg-gray-400";
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs text-white ${color}`}>{status}</span>;
}

function Table({ rows, loading, error }: { rows: MergedComponent[]; loading: boolean; error?: string }) {
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

function StatsCard({ stats }: { stats: { total: number; compliant: number; non: number; unknown: number } }) {
  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);
  return (
    <div className="rounded border border-gray-200 dark:border-neutral-800 p-4">
      <h2 className="font-medium mb-2">Compliance Summary</h2>
      <ul className="space-y-1 text-sm">
        <li>Total: {stats.total}</li>
        <li>Compliant: {stats.compliant} ({pct(stats.compliant)}%)</li>
        <li>Non-Compliant: {stats.non} ({pct(stats.non)}%)</li>
        <li>Unknown: {stats.unknown} ({pct(stats.unknown)}%)</li>
      </ul>
    </div>
  );
}

function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme:dark");
    const initial = stored === "true";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  return (
    <button
      className="rounded border px-3 py-1 text-sm border-gray-300 dark:border-neutral-800"
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme:dark", String(next));
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
