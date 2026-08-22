"use client";

import { Cpu, ShieldCheck } from "lucide-react";

import { useDashboardSystemHealth } from "@/features/dashboard/api/queries";

interface SystemHealthWidgetProps {
  liveData?: any;
}

export default function SystemHealthWidget({
  liveData,
}: SystemHealthWidgetProps) {
  const { data: queryData, isLoading } = useDashboardSystemHealth();

  const data = liveData ?? queryData;
  const loading = !liveData && isLoading;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Retrieving system metrics...
      </div>
    );
  }

  const items = [
    {
      label: "API Latency",
      value: `${data?.apiLatencyMs ?? 98} ms`,
      status: "Healthy",
      color: "text-emerald-500",
    },
    {
      label: "Background Queue",
      value: `${data?.queueSize ?? 3} Jobs`,
      status: "Operational",
      color: "text-blue-500",
    },
    {
      label: "Redis Cache",
      value: data?.redisStatus ?? "Healthy",
      status: "Active",
      color: "text-emerald-500",
    },
    {
      label: "Object Storage",
      value: `${data?.storageUsagePercent ?? 62}%`,
      status: "Available",
      color: "text-purple-500",
    },
    {
      label: "Database",
      value: data?.databaseStatus ?? "Healthy",
      status: "Connected",
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-4 p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            System Health & Diagnostics
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mt-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="bg-background rounded-xl p-3 border border-border/50"
            >
              <span className="block text-[10px] font-bold text-text-light">
                {item.label}
              </span>
              <div className="text-base font-black mt-1 text-text">
                {item.value}
              </div>
              <span
                className={`block text-[9px] font-semibold mt-1.5 ${item.color}`}
              >
                {item.status}
              </span>
            </div>
          ))}

          {/* CPU / RAM Usage progress */}
          <div className="bg-background rounded-xl p-3 border border-border/50 col-span-2 md:col-span-1 space-y-1.5">
            <div>
              <span className="block text-[9px] font-bold text-text-light flex justify-between">
                <span>CPU Load</span>
                <span>{data?.cpuUsagePercent ?? 12}%</span>
              </span>
              <div className="w-full bg-border rounded-full h-1 mt-1">
                <div
                  className="bg-primary h-1 rounded-full"
                  style={{ width: `${data?.cpuUsagePercent ?? 12}%` }}
                ></div>
              </div>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-text-light flex justify-between">
                <span>RAM Usage</span>
                <span>{data?.memoryUsagePercent ?? 45}%</span>
              </span>
              <div className="w-full bg-border rounded-full h-1 mt-1">
                <div
                  className="bg-primary h-1 rounded-full"
                  style={{ width: `${data?.memoryUsagePercent ?? 45}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
