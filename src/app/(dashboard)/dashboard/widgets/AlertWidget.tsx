'use client';

import { AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

import { useDashboardStore } from '@/store/useDashboardStore';

export default function AlertWidget() {
  const snapshot = useDashboardStore((state) => state.snapshot);

  /**
   * Snapshot has not arrived yet.
   */
  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse text-sm italic text-text-light">
        Checking warning status...
      </div>
    );
  }

  if (snapshot.alerts === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light">
        Alerts are unavailable for your account.
      </div>
    );
  }

  /**
   * Backend permission filtering.
   *
   * If the current user does not have permission,
   * the alerts property will be omitted.
   */
  const alerts = snapshot.alerts ?? [];

  const totalWarnings = alerts.reduce((total, alert) => total + alert.value, 0);

  return (
    <div className="flex h-full flex-col justify-between space-y-4 p-5">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-light">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
            Critical System Warnings
          </h3>

          {totalWarnings > 0 && (
            <span className="animate-pulse rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
              {totalWarnings} Alerts
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          {alerts.map((alert) => (
            <div
              key={alert.label}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                alert.value > 0
                  ? 'border-red-500/20 bg-red-500/5 font-semibold text-red-600'
                  : 'border-border/50 bg-background text-text-light'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.value > 0 ? (
                  <AlertTriangle className="h-4 w-4 animate-bounce text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-text-light" />
                )}

                <span>{alert.label}</span>
              </div>

              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  alert.value > 0 ? 'bg-red-500/10' : 'bg-border/30'
                }`}
              >
                {alert.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
