"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type Props = {
  compliant: number;
  non: number;
  unknown: number;
};

export default function ComplianceChart({ compliant, non, unknown }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    const ctx = ref.current.getContext("2d");
    if (!ctx) return;
    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Compliant", "Non-Compliant", "Unknown"],
        datasets: [
          {
            data: [compliant, non, unknown],
            backgroundColor: ["#22c55e", "#ef4444", "#9ca3af"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom" as const, labels: { boxWidth: 12 } },
        },
      },
    });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [compliant, non, unknown]);

  return (
    <div className="rounded border border-gray-200 dark:border-neutral-800 p-4">
      <h2 className="font-medium mb-2">Compliance Chart</h2>
      <canvas ref={ref} aria-label="Compliance doughnut chart" />
    </div>
  );
}


