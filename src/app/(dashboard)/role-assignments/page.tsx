//@ts-nocheck
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, ShieldAlert } from 'lucide-react';

import type { CreateAssignmentDto, UserRoleAssignment } from '@/features/rbac/types';
import RoleAssignmentDetailsModal from '@/components/roleAssignment/RoleAssignmentDetailsModal';
import RoleAssignmentsListView from '@/components/roleAssignment/RoleAssignmentsListView';
import RoleAssignmentsStatsView from '@/components/roleAssignment/RoleAssignmentsStatsView';
import RoleCreateDrawer from '@/components/roleAssignment/RoleCreateDrawer';
import { useAuthStore } from '@/features/auth/store/store';
import { rbacApi } from '@/features/rbac/api/api';
import { usePermissions } from '@/hooks/usePermissions';

function RoleAssignmentsPageContent() {
  const { hasPermission, isInitializing } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);

  const canViewAssignments =
    hasPermission('role.view') || hasPermission('role.assign') || hasPermission('rbac.manage');

  const [activeTab, setActiveTab] = useState<'stats' | 'list'>('stats');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected assignment for Details Modal
  const [selectedAssignment, setSelectedAssignment] = useState<UserRoleAssignment | null>(null);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'list') {
      setActiveTab('list');
    } else {
      setActiveTab('stats');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'stats' | 'list') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', tab);
    router.push(`/role-assignments?${params.toString()}`);
  };

  async function loadAssignments() {
    setLoading(true);
    try {
      const res = await rbacApi.getAssignments();
      setAssignments(res.data.success ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load role assignments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  async function handleCreateAssignment(data: CreateAssignmentDto) {
    try {
      await rbacApi.createAssignment(data);
      loadAssignments();
    } catch (err) {
      console.error(err);
    }
  }

  // Maker-Checker Handlers
  async function handleSubmitForReview(assignment: UserRoleAssignment) {
    try {
      await rbacApi.updateAssignmentStatus(
        assignment.id,
        'SUBMITTED',
        'Submitted for Maker-Checker review',
      );
      loadAssignments();
      if (selectedAssignment?.id === assignment.id) setSelectedAssignment(null);
    } catch (err) {
      console.error('Failed to submit assignment for review:', err);
    }
  }

  async function handleApproveAssignment(assignment: UserRoleAssignment) {
    if (assignment.status === 'DRAFT') {
      alert('Draft role assignments must be submitted for review before approval.');
      return;
    }
    try {
      await rbacApi.updateAssignmentStatus(
        assignment.id,
        'APPROVED',
        'Approved by Maker-Checker administrator',
      );
      loadAssignments();
      if (selectedAssignment?.id === assignment.id) setSelectedAssignment(null);
    } catch (err) {
      console.error('Failed to approve assignment:', err);
    }
  }

  async function handleRejectAssignment(assignment: UserRoleAssignment) {
    const reason = prompt('Optional rejection comment/reason:');
    try {
      await rbacApi.updateAssignmentStatus(
        assignment.id,
        'REJECTED',
        reason || 'Rejected by reviewer',
      );
      loadAssignments();
      if (selectedAssignment?.id === assignment.id) setSelectedAssignment(null);
    } catch (err) {
      console.error('Failed to reject assignment:', err);
    }
  }

  async function handleDeleteAssignment(id: string) {
    const target = assignments.find((a) => a.id === id);
    if (target && currentUser?.id && target.userId === currentUser.id) {
      alert('You cannot revoke your own role assignment.');
      return;
    }

    if (confirm('Are you sure you want to remove this role assignment?')) {
      try {
        const res = await rbacApi.deleteAssignment(id);
        if (res.data.success) {
          loadAssignments();
          if (selectedAssignment?.id === id) setSelectedAssignment(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleViewDetails(assignment: UserRoleAssignment) {
    setSelectedAssignment(assignment);
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-text-light">Loading role assignments...</p>
      </div>
    );
  }

  if (!canViewAssignments) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3 animate-fade-in my-6">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-text">Role Assignments Access Restricted</h2>
        <p className="text-xs text-text-light max-w-md mx-auto">
          Your account does not have permission (
          <code className="bg-background px-1.5 py-0.5 rounded border border-border text-rose-600 dark:text-rose-400 font-mono">
            role.view
          </code>
          ) to view user role assignments. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab 1: Stats & Overview View */}
      {activeTab === 'stats' && (
        <RoleAssignmentsStatsView
          assignments={assignments}
          onNavigateToList={() => handleTabChange('list')}
        />
      )}

      {/* Tab 2: AG Grid List View */}
      {activeTab === 'list' && (
        <RoleAssignmentsListView
          assignments={assignments}
          loading={loading}
          onOpenDrawer={() => setDrawerOpen(true)}
          onDeleteAssignment={handleDeleteAssignment}
          onViewDetails={handleViewDetails}
          onSubmitForReview={handleSubmitForReview}
          onApproveAssignment={handleApproveAssignment}
          onRejectAssignment={handleRejectAssignment}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Role Assignment Drawer */}
      <RoleCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateAssignment}
      />

      {/* Maker-Checker Details Modal */}
      <RoleAssignmentDetailsModal
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSubmitForReview={handleSubmitForReview}
        onApproveAssignment={handleApproveAssignment}
        onRejectAssignment={handleRejectAssignment}
      />
    </div>
  );
}

export default function RoleAssignmentsPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-text-light">Loading Role Assignments...</div>}
    >
      <RoleAssignmentsPageContent />
    </Suspense>
  );
}
