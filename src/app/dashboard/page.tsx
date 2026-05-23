"use client";

import useSWR from "swr";
import { Loader2, Users, CheckCircle, Clock } from "lucide-react";
import clsx from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  // Poll every 3 seconds for real-time updates
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data?.providers) {
    return (
      <div className="text-center text-rose-400 mt-10">
        Failed to load dashboard data.
      </div>
    );
  }

  const providers = data.providers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Provider Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time overview of lead allocations and quotas.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((provider: any) => (
          <div key={provider.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="p-5 border-b border-gray-800">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  provider.currentQuota > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {provider.currentQuota} left
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-950 rounded-lg p-3 border border-gray-800/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-2xl font-bold text-white">{provider._count.assignments}</p>
                </div>
                <div className="bg-gray-950 rounded-lg p-3 border border-gray-800/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quota</p>
                  <p className="text-2xl font-bold text-white">{provider.quota}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Recent Leads
              </h4>
              {provider.assignments.length === 0 ? (
                <p className="text-sm text-gray-600 italic">No leads assigned yet.</p>
              ) : (
                <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {provider.assignments.map((assignment: any) => (
                    <li key={assignment.leadId} className="bg-gray-800/50 rounded-md p-3 border border-gray-700/50">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-gray-200">{assignment.lead.name}</span>
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                          {assignment.lead.service.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{assignment.lead.phone} • {assignment.lead.city}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
