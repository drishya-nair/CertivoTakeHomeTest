"use client";
import { useEffect, useMemo, useState } from "react";
import { useComplianceStore } from "@/stores/complianceStore";
import type { MergedComponent } from "@/types";
import ComplianceChart from "@/components/ComplianceChart";
import ComplianceTable from "@/components/ComplianceTable";
import StatsCard from "@/components/StatsCard";
import DarkModeToggle from "@/components/DarkModeToggle";
import ErrorBoundary from "@/components/ErrorBoundary";

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

      <ErrorBoundary>
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
            <ComplianceTable loading={loading} error={error} rows={filtered} />
          </div>
          <div className="space-y-4">
            <StatsCard stats={stats} />
            <ComplianceChart compliant={stats.compliant} non={stats.non} unknown={stats.unknown} />
          </div>
        </div>
      </ErrorBoundary>
    </main>
  );
}

