"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Layers,
  MessageSquare,
  Shield,
  User,
  XCircle,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  countryId: string;
  stateId?: string | null;
  requestId?: string | null;
  actorId?: string | null;
  actorType: "SYSTEM" | "USER" | "JOB" | "API";
  eventType: string;
  title: string;
  description?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  actor?: {
    id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  createdAt: string;
}

interface TimelineProps {
  countryName: string;
  stateName?: string;
  activities: ActivityItem[];
  onClose?: () => void;
}

export const CountryActivityTimeline: React.FC<TimelineProps> = ({
  countryName,
  stateName,
  activities,
  onClose,
}) => {
  const [activeTimeline, setActiveTimeline] = useState<"lifecycle" | "request">(
    "lifecycle",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "SEEDED":
        return <Layers className="w-4 h-4 text-blue-400" />;
      case "ACTIVATED":
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "DEACTIVATED":
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "REQUEST_CREATED":
        return <FileText className="w-4 h-4 text-amber-400" />;
      case "REVIEWER_ASSIGNED":
        return <User className="w-4 h-4 text-purple-400" />;
      case "COMMENT_ADDED":
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case "CASCADE_EXECUTED":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (activeTimeline === "request") {
      return !!act.requestId;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-6 overflow-y-auto rounded-xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            {countryName} {stateName ? `→ ${stateName}` : ""} Audit Timeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Immutable chronological record of changes, reviews, and cascades
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Timeline Switcher Tabs */}
      <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-6">
        <button
          onClick={() => setActiveTimeline("lifecycle")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTimeline === "lifecycle"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          Country Lifecycle
        </button>
        <button
          onClick={() => setActiveTimeline("request")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTimeline === "request"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          Workflow Tickets
        </button>
      </div>

      {/* Stepper Timeline Feed */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No audit activity events recorded yet.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {filteredActivities.map((act) => {
            const isExpanded = expandedId === act.id;
            return (
              <div key={act.id} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-[30px] top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:border-indigo-500 transition-colors">
                  {getEventIcon(act.eventType)}
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base">
                          {act.title}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-medium ${
                            act.actorType === "SYSTEM"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {act.actorType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {act.actor?.fullName ||
                          (act.actorType === "SYSTEM"
                            ? "System Engine"
                            : "Admin User")}{" "}
                        • {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : act.id)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {act.description && (
                    <p className="text-sm text-slate-300 mt-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                      {act.description}
                    </p>
                  )}

                  {/* Metadata & Diff Expansion */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-850 text-xs space-y-2">
                      {act.metadata?.reason && (
                        <div>
                          <span className="text-slate-500 font-medium">
                            Reason:{" "}
                          </span>
                          <span className="text-amber-300">
                            {act.metadata.reason}
                          </span>
                        </div>
                      )}

                      {act.oldValue && act.newValue && (
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                          <div>
                            <span className="text-rose-400 font-medium">
                              Previous:
                            </span>
                            <pre className="text-[11px] text-slate-400 font-mono mt-1">
                              {JSON.stringify(act.oldValue, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-medium">
                              New:
                            </span>
                            <pre className="text-[11px] text-slate-400 font-mono mt-1">
                              {JSON.stringify(act.newValue, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
