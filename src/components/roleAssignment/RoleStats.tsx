"use client";

import { Activity, Clock, ShieldCheck, Users, AlertTriangle } from "lucide-react";
import type { UserRoleAssignment } from "@/features/rbac/types";

export interface RoleStatsProps {
  assignments?: UserRoleAssignment[];
}

export default function RoleStats({ assignments = [] }: RoleStatsProps) {
  const total = assignments.length;
  const now = Date.now();

  const active = assignments.filter((a) => !a.expiresAt || new Date(a.expiresAt).getTime() > now).length;
  const timeBound = assignments.filter((a) => a.expiresAt && new Date(a.expiresAt).getTime() > now).length;
  const expired = assignments.filter((a) => a.expiresAt && new Date(a.expiresAt).getTime() <= now).length;

  const statsList = [
    {
      title: "Total Assignments",
      value: total,
      change: `${active} Active`,
      icon: Users,
      color: "bg-indigo-100 text-primary dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      title: "Active Roles",
      value: active,
      change: "Live Access",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    },
    {
      title: "Time-Bound Access",
      value: timeBound,
      change: "Scheduled Expiration",
      icon: Clock,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Expired Access",
      value: expired,
      change: expired > 0 ? "Requires Revocation" : "Clean Audit",
      icon: AlertTriangle,
      color: expired > 0 ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {statsList.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                <Icon size={20} />
              </div>

              {item.change && (
                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-[10px] font-bold text-text-light">
                  {item.change}
                </span>
              )}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-light">
              {item.title}
            </p>

            <h3 className="mt-1 text-3xl font-bold text-text">{item.value}</h3>
          </div>
        );
      })}
    </div>
  );
}
