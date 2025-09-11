"use client";

import { MergedComponent } from "@certivo/shared-types";

interface StatusIndicatorProps {
  status: MergedComponent["status"];
  size?: "sm" | "md" | "lg";
}

export default function StatusIndicator({ 
  status, 
  size = "md"
}: StatusIndicatorProps) {
  const getStatusConfig = (status: MergedComponent["status"]) => {
    switch (status) {
      case "Compliant":
        return {
          color: "bg-green-500",
          text: "Compliant",
        };
      case "Non-Compliant":
        return {
          color: "bg-red-500",
          text: "Non-Compliant",
        };
      case "Unknown":
      default:
        return {
          color: "bg-gray-500",
          text: "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <div
      className={`${config.color} ${sizeClasses[size]} rounded-md text-white font-medium inline-flex items-center justify-center min-w-28`}
      title={status}
    >
      {config.text}
    </div>
  );
}
