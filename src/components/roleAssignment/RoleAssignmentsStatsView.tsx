'use client';

import { Clock, ShieldCheck } from 'lucide-react';

import type { UserRoleAssignment } from '@/features/rbac/types';
import RoleStats from '@/components/roleAssignment/RoleStats';
import Button from '@/components/ui/Button';

interface RoleAssignmentsStatsViewProps {
  assignments: UserRoleAssignment[];
  onNavigateToList: () => void;
}

export default function RoleAssignmentsStatsView({
  assignments,
  onNavigateToList,
}: RoleAssignmentsStatsViewProps) {
  const activeTimeBoundCount = assignments.filter(
    (a) => a.expiresAt && new Date(a.expiresAt).getTime() > Date.now(),
  ).length;

  return (
    <div className="space-y-6">
      <RoleStats assignments={assignments} />

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-text">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Role Distribution & Security Governance
          </div>
          <p className="text-xs text-text-light leading-relaxed">
            Review assigned administrative privileges across active users. Enforce separation of
            duties by ensuring non-admin users cannot hold system governance roles.
          </p>
          <div className="pt-2 flex gap-3">
            <Button size="sm" onClick={onNavigateToList}>
              View All Assignments ({assignments.length})
            </Button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-text">
            <Clock className="h-5 w-5 text-amber-500" />
            Time-Bound Lifecycle Auditing
          </div>
          <p className="text-xs text-text-light leading-relaxed">
            Temporary role access automatically expires upon reaching the specified expiration
            timestamp. Expired access rights are flagged for revocation to maintain strict audit
            integrity.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-amber-700 font-semibold">
            <span>● Active Time-bound: {activeTimeBoundCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
