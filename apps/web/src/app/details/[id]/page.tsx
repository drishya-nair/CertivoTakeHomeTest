"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useComplianceStore } from "@/stores/complianceStore";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, merged, loading, fetchMerged, login } = useComplianceStore();

  useEffect(() => {
    (async () => {
      if (!token) {
        await login(process.env.NEXT_PUBLIC_DEMO_USER || "admin", process.env.NEXT_PUBLIC_DEMO_PASS || "password");
      }
      if (!merged) await fetchMerged();
    })();
  }, [token, merged, login, fetchMerged]);

  const component = merged?.components.find((c) => c.id === params.id);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <button className="mb-4" onClick={() => router.back()}>
        ← Back
      </button>
      <ErrorBoundary>
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
        ) : loading ? (
          <div>Loading…</div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">Component not found.</div>
        )}
      </ErrorBoundary>
    </main>
  );
}


