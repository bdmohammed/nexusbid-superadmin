"use client";

import { useEffect, useState } from "react";
import { FolderKanban, CheckCircle2, AlertTriangle, FileText, Send, Archive } from "lucide-react";
import { apiClient } from "@/lib/http";

export default function TenderWorkflowWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/dashboard/tenders")
      .then((res) => {
        setData(res.data?.data);
      })
      .catch((err) => console.error("Failed to load tender workflow statistics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Compiling procurement stats...
      </div>
    );
  }

  const stages = [
    { label: "Draft", value: data?.DRAFT ?? 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Under Review", value: data?.UNDER_REVIEW ?? 0, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Published", value: data?.PUBLISHED ?? 0, icon: Send, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Closing Today", value: data?.CLOSING_TODAY ?? 0, icon: AlertTriangle, color: "text-red-500 animate-pulse", bg: "bg-red-500/10" },
    { label: "Awarded", value: data?.AWARDED ?? 0, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Archived", value: data?.ARCHIVED ?? 0, icon: Archive, color: "text-text-light", bg: "bg-border/30" },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <FolderKanban className="h-4.5 w-4.5 text-primary" />
          Tender Workflow Lifecycle
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.label} className="bg-background rounded-xl p-3 border border-border/50 hover:shadow transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-light">{stage.label}</span>
                <span className={`p-1 rounded-md ${stage.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${stage.color}`} />
                </span>
              </div>
              <div className="text-xl font-black mt-2 text-text">{stage.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
