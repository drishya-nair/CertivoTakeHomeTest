interface StatsCardProps {
  stats: {
    total: number;
    compliant: number;
    non: number;
    unknown: number;
  };
}

export default function StatsCard({ stats }: StatsCardProps) {
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
