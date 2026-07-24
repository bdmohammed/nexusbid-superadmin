"use client";

import { Users, ShieldAlert, CheckCircle, Shield } from "lucide-react";
import { useDashboardUsers } from "@/features/dashboard/api/queries";

export default function UsersWidget() {
  const { data, isLoading } = useDashboardUsers();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Compiling active users...
      </div>
    );
  }

  const items = [
    { label: "Customers", value: data?.totalUsers ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Admins", value: data?.admins ?? 0, icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending Approvals", value: data?.pendingApprovals ?? 0, icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Blocked Users", value: data?.blockedUsers ?? 0, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <Users className="h-4.5 w-4.5 text-primary" />
          User Access Management
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-background rounded-xl p-3 border border-border/50 flex items-center gap-3">
              <span className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`h-4.5 w-4.5 ${item.color}`} />
              </span>
              <div>
                <span className="block text-[10px] font-bold text-text-light">{item.label}</span>
                <span className="text-lg font-black text-text">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
