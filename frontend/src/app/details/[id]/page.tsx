"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useComplianceStore } from "@/stores/complianceStore";

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { merged, fetchMerged } = useComplianceStore();

  useEffect(() => {
    if (!merged) fetchMerged();
  }, [merged, fetchMerged]);

  const component = merged?.components.find((c) => c.id === params.id);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <button className="mb-4 underline" onClick={() => router.back()}>
        ← Back
      </button>
      {component ? (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{component.id}</h1>
          <p>Material: {component.material}</p>
          <p>Substance: {component.substance ?? "—"}</p>
          <p>Mass: {component.mass}</p>
          <p>Threshold: {component.threshold_ppm ?? "—"}</p>
          <p>Status: {component.status}</p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Compliance history is mocked in this demo.
          </div>
        </div>
      ) : (
        <div>Loading…</div>
      )}
    </main>
  );
}


