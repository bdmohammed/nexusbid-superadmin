"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/http";

interface AlertWidgetProps {
  liveData?: any;
}

export default function AlertWidget({ liveData }: AlertWidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (liveData) {
      setData(liveData);
      setLoading(false);
      return;
    }

    apiClient.get("/dashboard/alerts")
      .then((res) => {
        setData(res.data?.data);
      })
      .catch((err) => console.error("Failed to load alerts data", err))
      .finally(() => setLoading(false));
  }, [liveData]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Checking warning status...
      </div>
    );
  }

  const alerts = [
    { label: "Security Threats", value: data?.securityAlerts ?? 0, type: "security" },
    { label: "Failed Payments", value: data?.failedPayments ?? 0, type: "billing" },
    { label: "Expired Subscriptions", value: data?.expiredSubscriptions ?? 0, type: "billing" },
    { label: "Closing Tenders Today", value: data?.closingTenders ?? 0, type: "tender" },
    { label: "Database System Errors", value: data?.systemErrors ?? 0, type: "system" },
  ];

  const totalWarnings = alerts.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-4 p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
            Critical System Warnings
          </h3>
          {totalWarnings > 0 && (
            <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded animate-pulse">
              {totalWarnings} Alerts
            </span>
          )}
        </div>

        <div className="space-y-2.5 mt-4">
          {alerts.map((alert) => (
            <div
              key={alert.label}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                alert.value > 0
                  ? "bg-red-500/5 border-red-500/20 text-red-600 font-semibold"
                  : "bg-background border-border/50 text-text-light"
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.value > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-text-light" />
                )}
                <span>{alert.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alert.value > 0 ? "bg-red-500/10" : "bg-border/30"}`}>
                {alert.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
