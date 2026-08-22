"use client";

import Link from "next/link";
import { ArrowUpRight,Plus, Zap } from "lucide-react";

import { useDashboardQuickActions } from "@/features/dashboard/api/queries";

export default function QuickActionsWidget() {
  const { data: actions = [], isLoading } = useDashboardQuickActions();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Checking capabilities...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5 h-full">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <Zap className="h-4.5 w-4.5 text-primary" />
          Quick Command Centre
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {actions.map((act) => (
          <Link
            key={act.title}
            href={act.route}
            className="inline-flex items-center justify-between p-3 text-xs font-bold rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/20 transition group"
          >
            <div className="flex items-center gap-1.5 text-text">
              <Plus className="h-3.5 w-3.5 text-primary" />
              {act.title}
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-light opacity-0 group-hover:opacity-100 transition" />
          </Link>
        ))}

        {actions.length === 0 && (
          <div className="col-span-2 text-center text-text-light italic py-2">
            No quick actions authorized for your permissions.
          </div>
        )}
      </div>
    </div>
  );
}
