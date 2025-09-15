"use client";
import { useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import { CHART_COLORS, CHART_LABELS } from "@/lib/constants";

interface ComplianceChartProps {
  compliant: number;
  non: number;
  unknown: number;
}

// Chart configuration for better maintainability
const chartConfig = {
  type: "doughnut" as const,
  options: {
    plugins: {
      legend: { 
        position: "bottom" as const, 
        labels: { boxWidth: 12 } 
      },
    },
  },
};

export default function ComplianceChart({ compliant, non, unknown }: ComplianceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Memoized data for better performance
  const chartData = [compliant, non, unknown];
  const backgroundColors = [
    CHART_COLORS.COMPLIANT,
    CHART_COLORS.NON_COMPLIANT,
    CHART_COLORS.UNKNOWN,
  ];

  // Initialize chart
  const initializeChart = useCallback(() => {
    if (!canvasRef.current || chartRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      ...chartConfig,
      data: {
        labels: CHART_LABELS,
        datasets: [{
          data: chartData,
          backgroundColor: backgroundColors,
          borderWidth: 0,
        }],
      },
    });
  }, [chartData, backgroundColors]);

  // Update chart data
  const updateChart = useCallback(() => {
    if (!chartRef.current) return;

    const dataset = chartRef.current.data.datasets[0];
    dataset.data = chartData;
    chartRef.current.update();
  }, [chartData]);

  // Initialize chart on mount
  useEffect(() => {
    initializeChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [initializeChart]);

  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      updateChart();
    }
  }, [updateChart]);

  return (
    <div 
      className="rounded border border-gray-200 dark:border-neutral-800 p-4" 
      role="region" 
      aria-label="Compliance chart"
    >
      <h2 className="font-medium mb-2">Compliance Chart</h2>
      <canvas 
        ref={canvasRef} 
        aria-label="Compliance doughnut chart showing distribution of compliant, non-compliant, and unknown components" 
      />
    </div>
  );
}


