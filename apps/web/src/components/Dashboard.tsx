"use client";
import { useEffect, useMemo } from "react";
import { useComplianceStore } from "@/stores/complianceStore";
import { useAuth } from "@/contexts/AuthContext";
import type { MergedComponent } from "@certivo/shared-types";
import ComplianceChart from "@/components/ComplianceChart";
import ComplianceTable from "@/components/ComplianceTable";
import StatsCard from "@/components/StatsCard";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import Button from "@/components/ui/Button";

// Header component for better organization
const DashboardHeader = ({ onLogout }: { onLogout: () => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h1 className="text-2xl sm:text-3xl font-semibold">Compliance Dashboard</h1>
    <div className="flex items-center gap-3 justify-end">
      <Button
        onClick={onLogout}
        variant="secondary"
        className="w-16 h-7 text-sm"
      >
        Logout
      </Button>
      <ThemeToggle />
    </div>
  </div>
);

// Main content grid component
const DashboardContent = ({ 
  filter, 
  onFilterChange, 
  filteredRows, 
  loading, 
  error, 
  stats 
}: {
  filter: string;
  onFilterChange: (value: string) => void;
  filteredRows: MergedComponent[];
  loading: boolean;
  error?: string;
  stats: { total: number; compliant: number; non: number; unknown: number };
}) => (
  <div className="mt-6 space-y-6">
    {/* Mobile: Vertical layout - Stats and Chart first, then Search and Table */}
    <div className="block md:hidden space-y-4">
      <StatsCard stats={stats} />
      <ComplianceChart 
        compliant={stats.compliant} 
        non={stats.non} 
        unknown={stats.unknown} 
      />
      <div className="flex items-center gap-3">
        <SearchBar
          value={filter}
          onChange={onFilterChange}
          placeholder="Search by part or status..."
          className="w-full"
        />
      </div>
      <ComplianceTable loading={loading} error={error} rows={filteredRows} />
    </div>

    {/* Medium screens: Stats and Chart in one row, Table below */}
    <div className="hidden md:block lg:hidden space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard stats={stats} />
        <ComplianceChart 
          compliant={stats.compliant} 
          non={stats.non} 
          unknown={stats.unknown} 
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SearchBar
            value={filter}
            onChange={onFilterChange}
            placeholder="Search by part or status..."
            className="w-full"
          />
        </div>
        <ComplianceTable loading={loading} error={error} rows={filteredRows} />
      </div>
    </div>

    {/* Large screens: Original layout preserved */}
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-3">
          <SearchBar
            value={filter}
            onChange={onFilterChange}
            placeholder="Search by part or status..."
            className="w-full"
          />
        </div>
        <ComplianceTable loading={loading} error={error} rows={filteredRows} />
      </div>
      <div className="space-y-4">
        <StatsCard stats={stats} />
        <ComplianceChart 
          compliant={stats.compliant} 
          non={stats.non} 
          unknown={stats.unknown} 
        />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { merged, loading, error, fetchMerged, filter, setFilter } = useComplianceStore();
  const { logout } = useAuth();

  // Fetch data on mount
  useEffect(() => {
    fetchMerged();
  }, [fetchMerged]);

  // Filter components based on search query
  const filteredRows = useMemo<MergedComponent[]>(() => {
    if (!merged?.components) return [];
    
    const query = filter.trim().toLowerCase();
    if (!query) return merged.components;
    
    return merged.components.filter((component) => 
      component.id.toLowerCase().includes(query) || 
      component.status.toLowerCase().includes(query)
    );
  }, [merged?.components, filter]);

  // Calculate compliance statistics
  const stats = useMemo(() => {
    const components = merged?.components;
    if (!components?.length) {
      return { total: 0, compliant: 0, non: 0, unknown: 0 };
    }

    const counts = components.reduce(
      (acc, component) => {
        if (component.status === "Compliant") acc.compliant++;
        else if (component.status === "Non-Compliant") acc.non++;
        else acc.unknown++;
        return acc;
      },
      { compliant: 0, non: 0, unknown: 0 }
    );

    return {
      total: components.length,
      ...counts,
    };
  }, [merged?.components]);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <DashboardHeader onLogout={logout} />
      
      <ErrorBoundary>
        <DashboardContent
          filter={filter}
          onFilterChange={setFilter}
          filteredRows={filteredRows}
          loading={loading}
          error={error}
          stats={stats}
        />
      </ErrorBoundary>
    </main>
  );
}
