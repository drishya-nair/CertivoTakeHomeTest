"use client";
import { MergedComponent } from "@certivo/shared-types";
import { STATUS_SIZES } from "@/lib/constants";

interface StatusIndicatorProps {
  status: MergedComponent["status"];
  size?: "sm" | "md" | "lg";
}

// Status configuration mapping for better performance and maintainability
const STATUS_CONFIG = {
  "Compliant": { color: "bg-green-500", text: "Compliant" },
  "Non-Compliant": { color: "bg-red-500", text: "Non-Compliant" },
  "Unknown": { color: "bg-gray-500", text: "Unknown" },
} as const;

// Base styles for status indicator
const baseStyles = "rounded-md text-white font-medium inline-flex items-center justify-center min-w-7";

export default function StatusIndicator({ 
  status, 
  size = "md"
}: StatusIndicatorProps) {
  // Get status configuration with fallback for unknown statuses
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Unknown"];

  return (
    <div
      className={`${config.color} ${STATUS_SIZES[size]} ${baseStyles}`}
      title={status}
      role="status"
      aria-label={`Status: ${config.text}`}
    >
      {config.text}
    </div>
  );
}
