"use client";

import React from "react";
import { AlertCircle, Settings2,Sparkles } from "lucide-react";

interface DashboardBannerProps {
  greetingText: string;
  liveQueue: any;
  liveAlerts: any;
  sseConnected: boolean;
  onConnectSSE: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  canCustomize?: boolean;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  greetingText,
  liveQueue,
  liveAlerts,
  sseConnected,
  onConnectSSE,
  isEditMode,
  onToggleEditMode,
  canCustomize = true,
}) => {
  return (
    <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-black tracking-tight text-text flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6 animate-pulse" />
          {greetingText}!
        </h1>
        <p className="text-xs text-text-light font-medium max-w-xl">
          {liveQueue?.pendingTenderReviews > 0
            ? `${liveQueue.pendingTenderReviews} Tenders require compliance reviews.`
            : "All tender review queues are clear."}{" "}
          {liveAlerts?.securityAlerts > 0
            ? `${liveAlerts.securityAlerts} Security threats flagged today.`
            : "No active security threats logged."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {sseConnected ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Feed Connected
          </span>
        ) : (
          <button
            onClick={onConnectSSE}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-600 bg-amber-500/10 rounded-full hover:bg-amber-500/20 transition cursor-pointer"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Reconnect stream
          </button>
        )}

        {canCustomize && (
          <button
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
              isEditMode
                ? "bg-primary border-primary text-white"
                : "border-border bg-surface text-text hover:bg-border/30"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            {isEditMode ? "Exit Customizer" : "Customize Grid"}
          </button>
        )}
      </div>
    </div>
  );
};
