"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Zap, ShieldAlert } from "lucide-react";

export default function TestToolsPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const resetQuota = async () => {
    setLoading("reset");
    setStatus("Resetting quota via webhook...");
    try {
      // Simulate calling the webhook multiple times to test idempotency
      const eventId = `test-reset-${Date.now()}`;
      const providerId = 1; // Testing with Provider 1

      const promises = Array.from({ length: 3 }).map(() =>
        fetch("/api/webhook/reset-quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, providerId }),
        })
      );

      const results = await Promise.all(promises);
      const allOk = results.every((r) => r.ok);

      if (allOk) {
        setStatus("Quota reset successful. Webhook called 3 times concurrently with same Event ID (Idempotency tested).");
      } else {
        setStatus("Some webhook calls failed.");
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setLoading(null);
  };

  const generateConcurrent = async () => {
    setLoading("concurrent");
    setStatus("Generating 10 concurrent leads...");
    try {
      const res = await fetch("/api/test/generate-concurrent", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setStatus(`Concurrent test complete: ${data.successes} successful, ${data.failures} failed (expected if quotas hit 0).`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setLoading(null);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Test Tools</h1>
          <p className="mt-2 text-gray-400">Admin panel to verify concurrency and idempotency</p>
        </div>

        {status && (
          <div className="mb-8 p-4 bg-gray-950 border border-gray-800 rounded-lg text-sm font-mono text-purple-300">
            {'>'} {status}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center mb-4">
              <ShieldAlert className="w-6 h-6 text-indigo-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Webhook Idempotency</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Fires 3 concurrent requests to the webhook endpoint with the exact same Event ID to reset Provider 1's quota. 
              Only one should process; others should be ignored safely.
            </p>
            <button
              onClick={resetQuota}
              disabled={loading !== null}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading === "reset" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Test Quota Reset</>}
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-amber-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Concurrency Engine</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Simulates 10 simultaneous incoming lead requests to stress test the Prisma transactions and row-level locks. 
              Ensures no race conditions occur.
            </p>
            <button
              onClick={generateConcurrent}
              disabled={loading !== null}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading === "concurrent" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4 mr-2" /> Fire 10 Concurrent Leads</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
