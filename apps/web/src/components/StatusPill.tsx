interface StatusPillProps {
  status: string;
}

export default function StatusPill({ status }: StatusPillProps) {
  const color = status === "Compliant" ? "bg-green-500" : status === "Non-Compliant" ? "bg-red-500" : "bg-gray-400";
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs text-white ${color}`}>{status}</span>;
}
