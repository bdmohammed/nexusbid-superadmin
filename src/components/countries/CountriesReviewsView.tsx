"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  ChevronRight,
  RefreshCw,
  Globe,
} from "lucide-react";
import { apiClient } from "@/lib/http";

interface TicketItem {
  id: string;
  requestNumber: string;
  targetType: string;
  countryId: string;
  countryName: string;
  stateId?: string | null;
  stateName?: string | null;
  action: "ACTIVATE" | "DEACTIVATE";
  status: string;
  reason: string;
  requestedBy: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  assignedReviewer?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  } | null;
  createdAt: string;
}

interface ReviewsProps {
  onOpenReviewModal: (requestId: string) => void;
}

export const CountriesReviewsView: React.FC<ReviewsProps> = ({
  onOpenReviewModal,
}) => {
  const [filter, setFilter] = useState<
    "assigned" | "pending" | "approved" | "rejected" | "all"
  >("all");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(
        `/countries/change-requests?filter=${filter}`
      );
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load review queue", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "assigned", label: "Assigned to Me" },
            { key: "pending", label: "Pending Review" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
            { key: "all", label: "All Tickets" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-light hover:text-text hover:bg-background"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchQueue}
          className="p-2 rounded-xl bg-background hover:bg-surface border border-border text-text-light hover:text-text text-xs transition-colors cursor-pointer"
          title="Refresh Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-text-light">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          Loading Change Request Queue...
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-light">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No change request tickets found in this queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onOpenReviewModal(ticket.id)}
              className="bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                    {ticket.requestNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${
                      ticket.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : ticket.status === "REJECTED"
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                  {ticket.countryName} {ticket.stateName ? `→ ${ticket.stateName}` : ""}
                </h4>

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      ticket.action === "DEACTIVATE"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {ticket.action}
                  </span>
                  <span className="text-xs text-text-light font-mono">
                    {ticket.targetType}
                  </span>
                </div>

                <p className="text-xs text-text-light line-clamp-2 mt-3 bg-background p-2.5 rounded-xl border border-border">
                  "{ticket.reason}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-text-light">
                <span className="truncate">By: <strong className="text-text font-semibold">{ticket.requestedBy?.fullName}</strong></span>
                <span className="flex items-center gap-1 text-primary font-medium shrink-0">
                  Inspect Ticket <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
