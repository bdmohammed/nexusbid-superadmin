"use client";

import Link from "next/link";
import { ArrowRight,Layers } from "lucide-react";

import { useDashboardReviewQueue } from "@/features/dashboard/api/queries";

interface ReviewQueueProps {
  liveData?: any;
}

export default function ReviewQueueWidget({ liveData }: ReviewQueueProps) {
  const { data: queryData, isLoading } = useDashboardReviewQueue();

  const data = liveData ?? queryData;
  const loading = !liveData && isLoading;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Polling review pipelines...
      </div>
    );
  }

  const items = [
    {
      label: "Pending Role Reviews",
      value: data?.pendingRoleReviews ?? 0,
      path: "/rbac",
    },
    {
      label: "Pending Tender Reviews",
      value: data?.pendingTenderReviews ?? 0,
      path: "/tenders",
    },
    {
      label: "Pending Subscription Reviews",
      value: data?.pendingSubscriptionReviews ?? 0,
      path: "/subscriptions",
    },
    {
      label: "Pending Category Reviews",
      value: data?.pendingCategoryReviews ?? 0,
      path: "/categories",
    },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <Layers className="h-4.5 w-4.5 text-primary" />
          Compliance Review Queue
        </h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/50"
          >
            <div>
              <span className="block text-xs font-semibold text-text-light">
                {item.label}
              </span>
              <span className="text-lg font-black text-text">{item.value}</span>
            </div>
            <Link
              href={item.path}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
