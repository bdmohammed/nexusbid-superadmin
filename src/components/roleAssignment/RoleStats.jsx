"use client";

import {
  Users,
  ShieldCheck,
  Gauge,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Total Admins",
    value: "124",
    change: "+12%",
    icon: Users,
    color: "bg-indigo-100 text-primary",
  },

  {
    title: "Pending Roles",
    value: "08",
    change: "",
    icon: ShieldCheck,
    color: "bg-orange-100 text-orange-600",
  },

  {
    title: "System Load",
    value: "24%",
    change: "",
    icon: Gauge,
    color: "bg-green-100 text-green-600",
  },

  {
    title: "Active Sessions",
    value: "42",
    change: "",
    icon: Activity,
    color: "bg-sky-100 text-sky-600",
  },
];

export default function RoleStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={20} />
              </div>

              {item.change && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {item.change}
                </span>
              )}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-text-light">
              {item.title}
            </p>

            <h3 className="mt-2 text-4xl font-bold">
              {item.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
}