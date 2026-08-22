"use client";

import React from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  Users,
} from "lucide-react";

import type { Tender } from "@/types";

interface TendersStatsViewProps {
  tenders: Tender[];
  totalBudgetSum: number;
}

function resolveTenderRow(raw: any) {
  if (!raw) return null;
  if (raw.tender || raw.version !== undefined || raw.title) {
    const parentTender = raw.tender || {};
    return {
      status: raw.status || "DRAFT",
      publicationStatus:
        parentTender.publicationStatus ||
        raw.publicationStatus ||
        "UNPUBLISHED",
      estimatedBudget: raw.estimatedBudget ?? 0,
    };
  }
  const ver = raw.activeVersion || {};
  return {
    status: ver.status || "DRAFT",
    publicationStatus: raw.publicationStatus || "UNPUBLISHED",
    estimatedBudget: ver.estimatedBudget ?? 0,
  };
}

export const TendersStatsView: React.FC<TendersStatsViewProps> = ({
  tenders,
  totalBudgetSum,
}) => {
  const rows = tenders.map((t) => resolveTenderRow(t)).filter(Boolean);

  const draftCount = rows.filter((r) => r?.status === "DRAFT").length;
  const reviewCount = rows.filter(
    (r) => r?.status === "UNDER_REVIEW" || r?.status === "REVIEW_ASSIGNED",
  ).length;
  const publishedCount = rows.filter(
    (r) =>
      r?.publicationStatus === "PUBLISHED" || r?.publicationStatus === "OPEN",
  ).length;

  return (
    <div className="space-y-6">
      {/* Metrics Scoreboard Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">
                Total Tenders
              </p>
              <h3 className="text-lg font-bold">{tenders.length}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Drafts</p>
              <h3 className="text-lg font-bold">{draftCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">
                Under Review
              </p>
              <h3 className="text-lg font-bold">{reviewCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/10 p-2 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Published</p>
              <h3 className="text-lg font-bold">{publishedCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">
                Total Budget
              </p>
              <h3 className="text-lg font-bold">
                ${(totalBudgetSum / 1000000).toFixed(1)}M
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">
                Total Bidders
              </p>
              <h3 className="text-lg font-bold">12</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Analytics Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-text border-b border-border pb-3">
            Tender Status & Health Distribution
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Published & Active Bids",
                count: publishedCount,
                color: "bg-green-500",
              },
              {
                label: "Draft & In Preparation",
                count: draftCount,
                color: "bg-yellow-500",
              },
              {
                label: "Governance Review & Submission",
                count: reviewCount,
                color: "bg-orange-500",
              },
            ].map((item) => {
              const pct =
                tenders.length > 0
                  ? Math.round((item.count / tenders.length) * 100)
                  : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold text-text-light mb-1.5">
                    <span>{item.label}</span>
                    <span>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-text border-b border-border pb-3">
            Procurement Volume & Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background border border-border space-y-1">
              <p className="text-xs text-text-light font-medium">
                Average Tender Value
              </p>
              <p className="text-xl font-bold text-text">
                $
                {tenders.length > 0
                  ? Math.round(totalBudgetSum / tenders.length).toLocaleString()
                  : "0"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border space-y-1">
              <p className="text-xs text-text-light font-medium">
                Active Bidding Windows
              </p>
              <p className="text-xl font-bold text-green-600">
                {publishedCount} Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
