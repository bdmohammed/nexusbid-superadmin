'use client';

import { Cpu, ShieldCheck } from 'lucide-react';

import {
  type DashboardMetric,
  DashboardMetricType,
  type DashboardStatus,
} from '@/features/dashboard/types';
import { useDashboardStore } from '@/store/useDashboardStore';

const statusColors: Record<DashboardStatus, string> = {
  healthy: 'text-emerald-500',
  operational: 'text-blue-500',
  available: 'text-purple-500',
  connected: 'text-emerald-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500',
};

export default function SystemHealthWidget() {
  const snapshot = useDashboardStore((state) => state.snapshot);

  /**
   * Waiting for first dashboard snapshot.
   */
  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse text-sm italic text-text-light">
        Retrieving system metrics...
      </div>
    );
  }

  /**
   * Permission filtered.
   */
  if (!snapshot.health) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light">
        System health is unavailable.
      </div>
    );
  }

  const metrics = new Map(snapshot.health.metrics.map((metric) => [metric.type, metric]));

  const cpuUsage = metrics.get(DashboardMetricType.CPU_USAGE_PERCENT);

  const memoryUsage = metrics.get(DashboardMetricType.MEMORY_USAGE_PERCENT);

  const cards = [
    DashboardMetricType.API_LATENCY,
    DashboardMetricType.QUEUE_SIZE,
    DashboardMetricType.REDIS,
    DashboardMetricType.STORAGE_USAGE,
    DashboardMetricType.DATABASE,
  ]
    .map((type) => metrics.get(type))
    .filter((metric): metric is DashboardMetric => metric !== undefined);

  return (
    <div className="flex h-full flex-col justify-between space-y-4 p-5">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-light">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            System Health & Diagnostics
          </h3>

          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-3">
          {cards.map((item) => (
            <div key={item.type} className="rounded-xl border border-border/50 bg-background p-3">
              <span className="block text-[10px] font-bold text-text-light">{item.label}</span>

              <div className="mt-1 text-base font-black text-text">
                {item.value !== undefined
                  ? `${item.value}${item.unit ? ` ${item.unit}` : ''}`
                  : item.status}
              </div>

              {item.status && (
                <span
                  className={`mt-1.5 block text-[9px] font-semibold ${statusColors[item.status]}`}
                >
                  {item.status}
                </span>
              )}
            </div>
          ))}

          <div className="col-span-2 space-y-1.5 rounded-xl border border-border/50 bg-background p-3 md:col-span-1">
            <div>
              <span className="flex justify-between text-[9px] font-bold text-text-light">
                <span>CPU Load</span>
                <span>{cpuUsage?.value ?? 0}%</span>
              </span>

              <div className="mt-1 h-1 w-full rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary"
                  style={{
                    width: `${cpuUsage?.value ?? 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <span className="flex justify-between text-[9px] font-bold text-text-light">
                <span>RAM Usage</span>
                <span>{memoryUsage?.value ?? 0}%</span>
              </span>

              <div className="mt-1 h-1 w-full rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary"
                  style={{
                    width: `${memoryUsage?.value ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
