"use client";

import React from "react";
import { CheckCircle, Clock, Key, Layers,Shield } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

interface RolesStatsViewProps {
  stats: {
    totalRoles: number;
    activeRoles: number;
    pendingReviews: number;
    moduleDistribution?: any[];
  } | null;
  roles: any[];
  loading?: boolean;
}

export const RolesStatsView: React.FC<RolesStatsViewProps> = ({
  stats,
  roles,
}) => {
  const totalRoles = stats?.totalRoles ?? roles.length;
  const activeRoles =
    stats?.activeRoles ?? roles.filter((r) => r.status === "ACTIVE").length;
  const pendingReviews =
    stats?.pendingReviews ??
    roles.filter(
      (r) =>
        r.versionStatus === "PENDING_REVIEW" ||
        r.versionStatus === "SUBMITTED" ||
        r.versionStatus === "IN_REVIEW",
    ).length;
  const systemRoles = roles.filter((r) => r.isSystemRole).length;
  const customRoles = Math.max(0, totalRoles - systemRoles);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <Card className="p-5 border border-border bg-surface shadow-sm w-full min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-light uppercase tracking-wider block truncate">
                Total Governance Roles
              </span>
              <h3 className="text-2xl font-bold text-text mt-1">
                {totalRoles}
              </h3>
              <p className="text-xs text-text-light mt-1 flex items-center gap-1 truncate">
                <span className="font-semibold text-primary">
                  {systemRoles} System
                </span>{" "}
                • <span>{customRoles} Custom</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Shield className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-surface shadow-sm w-full min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-light uppercase tracking-wider block truncate">
                Active Governance Roles
              </span>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeRoles}
              </h3>
              <p className="text-xs text-text-light mt-1 truncate">
                Approved & enforced in production
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-surface shadow-sm w-full min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-light uppercase tracking-wider block truncate">
                Pending Governance Reviews
              </span>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {pendingReviews}
              </h3>
              <p className="text-xs text-text-light mt-1 truncate">
                Awaiting Maker-Checker approval
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-surface shadow-sm w-full min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-light uppercase tracking-wider block truncate">
                System Seeded Roles
              </span>
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {systemRoles}
              </h3>
              <p className="text-xs text-text-light mt-1 truncate">
                Immutable core architecture
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Key className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Module Permission Distribution Overview */}
      <Card className="p-6 border border-border bg-surface shadow-sm space-y-4 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2 truncate">
              <Layers className="h-4 w-4 text-primary shrink-0" /> Role
              Permission Scope Breakdown
            </h3>
            <p className="text-xs text-text-light mt-0.5 truncate">
              Distribution of permission assignments across active system roles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {roles.map((role) => {
            const permCount =
              role.permissionKeys?.length || role.permissions?.length || 0;
            return (
              <div
                key={role.id}
                className="p-4 rounded-xl bg-background border border-border space-y-2 flex flex-col justify-between min-w-0"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className="font-bold text-xs text-text truncate flex-1 min-w-0"
                      title={role.name}
                    >
                      {role.name}
                    </span>
                    <Badge
                      color={role.status === "ACTIVE" ? "green" : "yellow"}
                      className="shrink-0"
                    >
                      {role.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-light line-clamp-2 min-h-[2.5rem]">
                    {role.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-text-light font-medium shrink-0">
                  <span>Permissions: {permCount}</span>
                  <span>v{role.version || 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
