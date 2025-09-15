import { useMemo } from "react";

interface StatsCardProps {
  stats: {
    total: number;
    compliant: number;
    non: number;
    unknown: number;
  };
}

// Calculate percentage with safe division
const calculatePercentage = (value: number, total: number): number => 
  total > 0 ? Math.round((value / total) * 100) : 0;

// Stat item component for consistent rendering
interface StatItemProps {
  label: string;
  value: number;
  percentage: number;
}

const StatItem = ({ label, value, percentage }: StatItemProps) => (
  <li>
    {label}: {value} ({percentage}%)
  </li>
);

export default function StatsCard({ stats }: StatsCardProps) {
  // Memoize percentage calculations for better performance
  const percentages = useMemo(() => ({
    compliant: calculatePercentage(stats.compliant, stats.total),
    non: calculatePercentage(stats.non, stats.total),
    unknown: calculatePercentage(stats.unknown, stats.total),
  }), [stats.compliant, stats.non, stats.unknown, stats.total]);
  
  return (
    <div 
      className="rounded border border-gray-200 dark:border-neutral-800 p-4" 
      role="region" 
      aria-label="Compliance summary statistics"
    >
      <h2 className="font-medium mb-2">Compliance Summary</h2>
      <ul className="space-y-1 text-sm" role="list">
        <li>Total: {stats.total}</li>
        <StatItem label="Compliant" value={stats.compliant} percentage={percentages.compliant} />
        <StatItem label="Non-Compliant" value={stats.non} percentage={percentages.non} />
        <StatItem label="Unknown" value={stats.unknown} percentage={percentages.unknown} />
      </ul>
    </div>
  );
}
