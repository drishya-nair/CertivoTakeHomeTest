"use client";

import { MergedComponent } from "@certivo/shared-types";

interface StatusIndicatorProps {
  status: MergedComponent["status"];
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function StatusIndicator({ 
  status, 
  size = "md", 
  showText = true 
}: StatusIndicatorProps) {
  const getStatusConfig = (status: MergedComponent["status"]) => {
    switch (status) {
      case "Compliant":
        return {
          color: "bg-green-500",
          textColor: "text-green-700 dark:text-green-400",
          icon: "✓",
        };
      case "Non-Compliant":
        return {
          color: "bg-red-500",
          textColor: "text-red-700 dark:text-red-400",
          icon: "✗",
        };
      case "Unknown":
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-700 dark:text-gray-400",
          icon: "?",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${config.color} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white text-xs font-bold`}
        title={status}
      >
        {size !== "sm" && config.icon}
      </div>
      {showText && (
        <span className={`text-sm font-medium ${config.textColor}`}>
          {status}
        </span>
      )}
    </div>
  );
}
