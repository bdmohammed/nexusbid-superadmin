"use client";

import React, { useEffect, useState } from "react";
import {
  Globe,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Clock,
} from "lucide-react";
import { apiClient } from "@/lib/http";

interface StatsProps {
  onOpenCreateModal: () => void;
  onSelectTab: (tab: "stats" | "list" | "reviews") => void;
}

export const CountriesStatsView: React.FC<StatsProps> = ({ }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get<any>("/countries/stats");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[
          {
            title: "Total Countries",
            val: stats?.totalCountries,
            icon: Globe,
            col: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
          },
          {
            title: "Active Operational",
            val: stats?.activeCountries,
            icon: CheckCircle2,
            col: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
          },
          {
            title: "Disabled / Inactive",
            val: stats?.disabledCountries,
            icon: XCircle,
            col: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
          },
          {
            title: "Open Review Tickets",
            val: stats?.openReviews,
            icon: FileCheck2,
            col: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
          },
          {
            title: "Assigned to Me",
            val: stats?.pendingMine,
            icon: Clock,
            col: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-light">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.col}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                {loading ? (
                  <div className="h-8 w-16 bg-border animate-pulse rounded-md" />
                ) : (
                  <h3 className="text-3xl font-bold tracking-tight text-text">{card.val ?? 0}</h3>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
