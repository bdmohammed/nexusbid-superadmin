"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { dashboardStats } from "@/data/dashboardData";

export default function DashboardStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}
              >
                <Icon size={26} className={item.iconColor} />
              </div>

              <div
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  item.trend === "up"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {item.trend === "up" ? (
                  <ArrowUp size={14} />
                ) : (
                  <ArrowDown size={14} />
                )}

                {item.change}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-base text-text-light">{item.title}</p>
              <h2 className="mt-2 text-5xl font-bold tracking-tight text-text">
                {item.value}
              </h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
