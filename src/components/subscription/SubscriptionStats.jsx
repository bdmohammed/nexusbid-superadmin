"use client";

import subscriptionStats from "@/data/subscriptionStats";
import { cn } from "@/lib/utils";

export default function SubscriptionStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {subscriptionStats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",

                  item.trendType === "success"
                    ? "bg-emerald-50 text-emerald-600"

                    : "bg-red-50 text-red-600"
                )}
              >
                <Icon size={22} />
              </div>

              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",

                  item.trendType === "success"
                    ? "bg-emerald-100 text-emerald-700"

                    : "bg-red-100 text-red-600"
                )}
              >
                {item.trend}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium uppercase tracking-wide text-text-light">
                {item.title}
              </p>

              <h2 className="mt-2 text-4xl font-bold text-text">
                {item.value}
              </h2>

              <p className="mt-2 text-sm text-text-light">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}