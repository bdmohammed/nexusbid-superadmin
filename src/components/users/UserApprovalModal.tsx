//@ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock,
  Globe,
  History,
  Mail,
  Send,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import Select from 'react-select';
import { toast } from 'sonner';

import { authApi } from '@/features/auth/api/api';
import {
  useActivateUser,
  useReviewApproval,
  useSubmitApproval,
  useSuspendUser,
} from '@/features/auth/api/mutations';
import { useCurrentUser } from '@/features/auth/api/queries';
import { rbacApi } from '@/features/rbac/api/api';

interface RoleOption {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface AdminUserOption {
  id: string;
  name: string;
  email: string;
}

interface UserTarget {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  accountType?: string;
  country?: { name: string; code: string } | string;
  status: string;
  requestedRoleId?: string;
  requestedDescription?: string;
  reviewerId?: string;
  submittedById?: string;
  createdAt?: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  createdAt: string;
  actorId?: string;
  after?: Record<string, any>;
}

interface UserApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserTarget | null;
  currentUserId?: string;
  onSuccess: () => void;
}

export const UserApprovalModal: React.FC<UserApprovalModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}) => {
  const { data: currentUserData } = useCurrentUser();
  const activeUserId = currentUserId || currentUserData?.id;

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [reviewers, setReviewers] = useState<AdminUserOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [approvalReq, setApprovalReq] = useState<any>(null);

  // Auth Mutation Hooks
  const activateUserMutation = useActivateUser();
  const suspendUserMutation = useSuspendUser();
  const submitApprovalMutation = useSubmitApproval();
  const reviewApprovalMutation = useReviewApproval();

  useEffect(() => {
    if (!isOpen || !user) return;

    // Reset state
    setSelectedRoleId(user.requestedRoleId || '');
    setDescription(user.requestedDescription || '');
    setSelectedReviewerId(user.reviewerId || '');
    setComment('');
    setApprovalReq(null);

    // Load roles, admin reviewers, and approval request entity
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [rolesRes, usersRes, reqRes] = await Promise.all([
          rbacApi.getRoles(),
          rbacApi.getAssignableUsers({
            accountType: 'admin',
            status: 'active',
            permission: 'user.manage',
            limit: 50,
          }),
          authApi.getApprovalRequest(user.id).catch(() => null),
        ]);

        const roleList = rolesRes.data?.data || rolesRes.data || [];
        setRoles(roleList);

        const rawUserList = usersRes.data?.data || usersRes.data || [];
        const adminList = rawUserList.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }));
        setReviewers(adminList);

        const requestData = reqRes?.data?.data || reqRes?.data || null;
        if (requestData) {
          setApprovalReq(requestData);
          if (requestData.requestedRoleId) setSelectedRoleId(requestData.requestedRoleId);
          if (requestData.requestedDescription) setDescription(requestData.requestedDescription);
          if (requestData.reviewerId) setSelectedReviewerId(requestData.reviewerId);
        } else {
          if (roleList.length > 0 && !selectedRoleId) setSelectedRoleId(roleList[0].id);
          if (adminList.length > 0 && !selectedReviewerId) setSelectedReviewerId(adminList[0].id);
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    // Fetch user audit history
    const fetchHistory = async () => {
      try {
        const res = await authApi.getUserAuditLog(user.id);
        const logs = res.data || [];
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to fetch audit history:', err);
      }
    };

    loadOptions();
    fetchHistory();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isCustomerAccount = user.accountType && user.accountType !== 'admin';

  // Determine stage based on user status or approval request entity
  const isPendingReviewStage =
    user?.status?.toLowerCase() === 'pending_review' ||
    (approvalReq?.status && approvalReq.status.toUpperCase() === 'PENDING');

  const submittedByUserId =
    approvalReq?.submittedBy?.id || approvalReq?.submittedById || user?.submittedById;

  const assignedReviewerId =
    approvalReq?.reviewer?.id || approvalReq?.reviewerId || user?.reviewerId;

  // Maker check
  const isMaker = Boolean(activeUserId && submittedByUserId && activeUserId === submittedByUserId);
  // Assigned Reviewer check
  const isAssignedReviewer = Boolean(
    activeUserId && assignedReviewerId && activeUserId === assignedReviewerId,
  );

  // Can the current logged-in user evaluate (approve/reject)?
  // Must be in pending review stage and must be the assigned reviewer6565
  const canReviewerDecide = isPendingReviewStage && isAssignedReviewer;

  // Direct Account Approval (for customers or direct admin activation)
  const handleDirectApprove = async () => {
    setSubmitting(true);
    try {
      await activateUserMutation.mutateAsync(user.id);
      toast.success(`User ${user.name} account approved & activated successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || 'Failed to approve user account');
    } finally {
      setSubmitting(false);
    }
  };

  // Direct Account Rejection
  const handleDirectReject = async () => {
    setSubmitting(true);
    try {
      await suspendUserMutation.mutateAsync(user.id);
      toast.success(`User ${user.name} account rejected`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || 'Failed to reject user account');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 1: Maker submits approval request to reviewer
  const handleSubmitApprovalRequest = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role to assign to the user');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description/justification for granting this role');
      return;
    }
    if (!selectedReviewerId) {
      toast.error('Please assign a reviewer to evaluate this request');
      return;
    }

    setSubmitting(true);
    try {
      await submitApprovalMutation.mutateAsync({
        id: user.id,
        input: {
          // roleId: selectedRoleId,
          notes: description.trim(),
          reviewerId: selectedReviewerId,
        },
      });
      toast.success(`Approval request for ${user.name} submitted to reviewer successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.message || err.response?.data?.message || 'Failed to submit approval request',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 2: Checker approves or rejects request
  const handleCheckerDecision = async (action: 'APPROVE' | 'REJECT') => {
    if (!canReviewerDecide) {
      toast.error('Only the assigned independent reviewer can evaluate or approve this request.');
      return;
    }

    if (action === 'REJECT' && !comment.trim()) {
      toast.error('Please state a reason/comment for rejecting this request');
      return;
    }

    setSubmitting(true);
    try {
      await reviewApprovalMutation.mutateAsync({
        id: user.id,
        input: {
          action,
          reason: comment.trim() || undefined,
        },
      });
      toast.success(
        action === 'APPROVE'
          ? `User ${user.name} account request approved and activated`
          : `User ${user.name} account request rejected`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.message || err.response?.data?.message || 'Failed to process review decision',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const assignedRoleName =
    approvalReq?.requestedRole?.name ||
    roles.find(
      (r) => r.id === (approvalReq?.requestedRoleId || user.requestedRoleId || selectedRoleId),
    )?.name ||
    'Pending Selection';

  const assignedReviewerName =
    approvalReq?.reviewer?.name ||
    reviewers.find(
      (u) => u.id === (approvalReq?.reviewerId || user.reviewerId || selectedReviewerId),
    )?.name ||
    'Assigned Reviewer';

  const submittedByName =
    approvalReq?.submittedBy?.name ||
    reviewers.find((u) => u.id === submittedByUserId)?.name ||
    'Maker Admin';

  const roleSelectOptions = roles.map((r) => ({
    value: r.id,
    label: `${r.name}${r.description ? ` — ${r.description}` : ''}`,
  }));

  const reviewerSelectOptions = reviewers.map((rev) => ({
    value: rev.id,
    label: `${rev.name} (${rev.email})`,
    isDisabled: rev.id === activeUserId && reviewers.length > 1,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-text">User Account Approval</h2>
              <p className="text-xs text-text-light">
                {isCustomerAccount
                  ? 'Evaluate customer account registration and manage activation status.'
                  : isPendingReviewStage
                    ? 'Stage 2 (Checker): Evaluate submitted request, review justification, and approve/reject.'
                    : 'Stage 1 (Maker): Select role, enter description, and assign an independent reviewer.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-light hover:text-text hover:bg-background transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Alert Banners */}
          {!isCustomerAccount && isPendingReviewStage && (
            <>
              {canReviewerDecide ? (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      Action Required: Reviewer Evaluation
                    </span>
                    <span>
                      You are the designated reviewer for this request. Please evaluate the
                      justification and select Approve or Reject below.
                    </span>
                  </div>
                </div>
              ) : isMaker ? (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      Request Submitted to Reviewer (Read-Only Mode)
                    </span>
                    <span>
                      You submitted this approval request as Maker. It is currently in read-only
                      mode awaiting evaluation by <strong>{assignedReviewerName}</strong>.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs">
                  <Clock size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      Pending Reviewer Evaluation (Read-Only Mode)
                    </span>
                    <span>
                      This approval request is assigned to <strong>{assignedReviewerName}</strong>.
                      Only the assigned reviewer can evaluate or approve this request.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* User Profile Overview */}
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text">{user.name}</h3>
                <div className="flex items-center gap-2 text-xs text-text-light mt-0.5">
                  <Mail size={12} />
                  <span>{user.email}</span>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${
                  user.status?.toLowerCase() === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : user.status?.toLowerCase() === 'pending_review'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : user.status?.toLowerCase()?.includes('pending')
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : user.status?.toLowerCase()?.includes('reject') ||
                            user.status?.toLowerCase() === 'blocked'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          : 'bg-surface text-text-light border-border'
                }`}
              >
                {user.status ? user.status.replace(/_/g, ' ') : 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-border/50">
              <div className="flex items-center gap-2 text-text-light">
                <Briefcase size={13} className="text-primary" />
                <div>
                  <span className="block text-[10px] uppercase text-text-light/70">Company</span>
                  <span className="font-medium text-text">{user.companyName || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-light">
                <Globe size={13} className="text-primary" />
                <div>
                  <span className="block text-[10px] uppercase text-text-light/70">Country</span>
                  <span className="font-medium text-text">
                    {typeof user.country === 'object'
                      ? user.country?.name
                      : user.country || 'Global'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-light">
                <UserCheck size={13} className="text-primary" />
                <div>
                  <span className="block text-[10px] uppercase text-text-light/70">
                    Account Type
                  </span>
                  <span className="font-medium text-text capitalize">
                    {user.accountType || 'customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Evaluation Field OR Admin Maker/Checker Form */}
          {isCustomerAccount ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text">
                Admin Evaluation Notes / Decision Remarks
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter evaluation notes or remarks for approving/rejecting this customer account..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-text focus:outline-none focus:border-primary transition"
              />
            </div>
          ) : !isPendingReviewStage ? (
            /* STAGE 1: Maker Submission Form */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">
                  1. Select Role to Assign <span className="text-rose-500">*</span>
                </label>
                {loadingOptions ? (
                  <div className="p-3 text-xs text-text-light animate-pulse">Loading roles...</div>
                ) : (
                  <Select
                    options={roleSelectOptions}
                    value={roleSelectOptions.find((opt) => opt.value === selectedRoleId) || null}
                    onChange={(selected) => setSelectedRoleId(selected?.value || '')}
                    placeholder="Search and select a Role..."
                    className="text-xs"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.75rem',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--surface)',
                        borderRadius: '0.75rem',
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--background)' : 'var(--surface)',
                        color: 'var(--text)',
                        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'var(--text)',
                      }),
                    }}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">
                  2. Role Description / Access Justification{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe responsibilities, access requirements, or justification..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-text focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">
                  3. Assign Independent Reviewer (Checker) <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={reviewerSelectOptions}
                  value={
                    reviewerSelectOptions.find((opt) => opt.value === selectedReviewerId) || null
                  }
                  onChange={(selected) => setSelectedReviewerId(selected?.value || '')}
                  placeholder="Search and select Reviewer Admin..."
                  className="text-xs"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.75rem',
                      zIndex: 9999,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'var(--background)' : 'var(--surface)',
                      color: 'var(--text)',
                      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--text)',
                    }),
                  }}
                />
              </div>
            </div>
          ) : (
            /* STAGE 2: Review Summary & Checker Decision */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-semibold text-text border-b border-primary/10 pb-2.5">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-text-light/70">
                      Proposed Role
                    </span>
                    <strong className="text-primary text-sm">{assignedRoleName}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-text-light/70">
                      Submitted By (Maker)
                    </span>
                    <span className="text-text">{submittedByName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-text-light/70">
                      Assigned Reviewer (Checker)
                    </span>
                    <span className="text-primary">{assignedReviewerName}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-text-light/70 mb-1">
                    Maker Justification / Access Reason
                  </span>
                  <p className="text-text font-normal italic leading-relaxed bg-background/60 p-2.5 rounded-lg border border-border/40">
                    "
                    {approvalReq?.requestedDescription ||
                      user.requestedDescription ||
                      description ||
                      'No justification provided.'}
                    "
                  </p>
                </div>
              </div>

              {/* Only show reviewer comment input if current user is the assigned reviewer */}
              {canReviewerDecide && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text">
                    Checker Reviewer Comment{' '}
                    <span className="text-text-light font-normal">(Required for rejection)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter audit evaluation notes or rejection comment..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-text focus:outline-none focus:border-primary transition"
                  />
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          {auditLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-text">
                <History size={14} className="text-primary" />
                <span>Account Audit Log History</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-background/50 border border-border/50 text-[11px] flex justify-between items-center"
                  >
                    <span className="font-mono text-text-light">{log.action}</span>
                    <span className="text-text-light/70">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-surface transition cursor-pointer"
          >
            {isPendingReviewStage && !canReviewerDecide ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            {/* Customer Account Actions */}
            {isCustomerAccount ? (
              <>
                <button
                  onClick={handleDirectReject}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Reject Account
                </button>

                <button
                  onClick={handleDirectApprove}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  {submitting ? 'Processing...' : 'Approve & Activate'}
                </button>
              </>
            ) : !isPendingReviewStage ? (
              /* Admin Stage 1 Actions (Maker Submission) */
              <button
                onClick={handleSubmitApprovalRequest}
                disabled={
                  submitting || !selectedRoleId || !description.trim() || !selectedReviewerId
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? 'Submitting...' : 'Submit to Reviewer'}
              </button>
            ) : canReviewerDecide ? (
              /* Admin Stage 2 Actions (Assigned Reviewer Only) */
              <>
                <button
                  onClick={() => handleCheckerDecision('REJECT')}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Reject Request
                </button>

                <button
                  onClick={() => handleCheckerDecision('APPROVE')}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  {submitting ? 'Processing...' : 'Approve & Activate'}
                </button>
              </>
            ) : (
              /* Read-Only Status Indicator */
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold">
                <Clock size={14} />
                Awaiting Reviewer Evaluation
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
