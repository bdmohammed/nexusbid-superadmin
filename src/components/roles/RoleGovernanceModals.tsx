//@ts-nocheck
'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import Select from 'react-select';

import type { Role } from '@/features/rbac/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Reusable Custom Styles for react-select matching theme CSS variables
const customReactSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    borderRadius: '0.75rem',
    minHeight: '42px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: 'var(--border)',
    },
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 99999,
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '6px',
    maxHeight: '220px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
        ? 'var(--background)'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--text)',
    fontSize: '0.75rem',
    borderRadius: '0.5rem',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    padding: '8px 12px',
    fontWeight: state.isSelected ? '600' : '500',
    '&:active': {
      backgroundColor: 'var(--background)',
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--text)',
    fontSize: '0.75rem',
    fontWeight: '500',
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'var(--background)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    padding: '1px 4px',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'var(--text)',
    fontSize: '0.75rem',
    fontWeight: '500',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'var(--text-light)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
    },
  }),
  input: (base: any) => ({
    ...base,
    color: 'var(--text)',
    fontSize: '0.75rem',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--text-light)',
    fontSize: '0.75rem',
  }),
};

// 1. Submit Review Modal
interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionToSubmit: any | null;
  assignableUsers: any[];
  selectedReviewers: string[];
  setSelectedReviewers: (val: string[]) => void;
  submitting: boolean;
  onSendForReview: () => void;
  currentUserId?: string;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onClose,
  versionToSubmit,
  assignableUsers,
  selectedReviewers,
  setSelectedReviewers,
  submitting,
  onSendForReview,
  currentUserId,
}) => {
  if (!isOpen || !versionToSubmit) return null;

  const reviewerOptions = assignableUsers.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.email})`,
    isDisabled: u.id === currentUserId && assignableUsers.length > 1,
  }));

  return (
    <Modal
      open={isOpen}
      title={`Submit Role Version Draft for Review — v${
        versionToSubmit.versionNumber || versionToSubmit.version || '0.1'
      }`}
      onClose={onClose}
      width="max-w-xl"
    >
      <div className="space-y-4 text-xs text-text">
        <div className="p-3.5 bg-background border border-border rounded-xl space-y-1">
          <p className="font-semibold text-text flex items-center justify-between">
            <span>Target Role: {versionToSubmit.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Draft v{versionToSubmit.versionNumber || versionToSubmit.version || '0.1'}
            </span>
          </p>
          <p className="text-text-light text-[11px]">
            Assign at least one administrator with reviewer permissions to evaluate and approve this
            role draft.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Select Governance Reviewer(s) <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={reviewerOptions}
            value={reviewerOptions.filter((opt) => selectedReviewers.includes(opt.value))}
            onChange={(selected) => setSelectedReviewers(selected.map((s) => s.value))}
            placeholder="Search and select reviewer..."
            menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
            menuPosition="fixed"
            styles={customReactSelectStyles}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSendForReview} disabled={selectedReviewers.length === 0 || submitting}>
            {submitting ? 'Submitting...' : 'Send to Reviewers'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 2. Role Review Action Console Modal
interface RoleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewRoleName: string;
  reviewCreatorId: string;
  currentUserId?: string;
  reviewDecision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  setReviewDecision: (val: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => void;
  reviewComment: string;
  setReviewComment: (val: string) => void;
  submitting: boolean;
  onSubmitReview: (e: React.FormEvent) => void;
  reviewDetails?: any;
  assignableUsers?: any[];
}

export const RoleReviewModal: React.FC<RoleReviewModalProps> = ({
  isOpen,
  onClose,
  reviewRoleName,
  reviewCreatorId,
  currentUserId,
  reviewDecision,
  setReviewDecision,
  reviewComment,
  setReviewComment,
  submitting,
  onSubmitReview,
  reviewDetails,
  assignableUsers = [],
}) => {
  if (!isOpen) return null;

  // 1. Check if current user is an assigned reviewer
  const assignments = reviewDetails?.roleReviewAssignments || reviewDetails?.assignments || [];

  const reviewerIds: string[] = assignments
    .map((a: any) => a.reviewerId || a.reviewer?.id)
    .filter(Boolean);

  const isAssignedReviewer =
    reviewerIds.length === 0 || (Boolean(currentUserId) && reviewerIds.includes(currentUserId!));

  // 2. Check Maker-Checker creator self-approval rule
  const creatorId =
    reviewCreatorId ||
    reviewDetails?.roleVersion?.createdByUserId ||
    reviewDetails?.roleVersion?.createdBy ||
    reviewDetails?.roleVersion?.createdByUser?.id;

  const isCreator = Boolean(currentUserId && creatorId && currentUserId === creatorId);
  const otherAdmins = assignableUsers.filter((u) => u.id !== currentUserId);
  const hasOtherAdmins = otherAdmins.length > 0;
  const isSelfApprovalBlocked = isCreator && hasOtherAdmins;

  const isApproveDisabled = !isAssignedReviewer || isSelfApprovalBlocked;

  return (
    <Modal
      open={isOpen}
      title={`Review Approval Console — ${reviewRoleName}`}
      onClose={onClose}
      width="max-w-2xl"
    >
      <form onSubmit={onSubmitReview} className="space-y-4 text-xs text-text">
        {!isAssignedReviewer && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Not an Assigned Reviewer</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                You are not an assigned reviewer for this role version draft. Only designated
                assigned reviewers can execute a review decision on this draft.
              </p>
            </div>
          </div>
        )}

        {isAssignedReviewer && isSelfApprovalBlocked && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-bold">Maker-Checker Self-Approval Blocked</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                You created this role draft version. Maker-Checker policy prevents self-approval
                when another administrator with role.manage permission exists in the system. Another
                administrator must review and approve this draft.
              </p>
            </div>
          </div>
        )}

        {reviewDetails?.comments && reviewDetails.comments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-text-light uppercase tracking-wider text-[11px]">
              Comments & Evaluation History
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-xl p-3 bg-background">
              {reviewDetails.comments.map((c: any) => (
                <div
                  key={c.id}
                  className="flex gap-2.5 items-start border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-text">{c.user?.name || 'System Reviewer'}</p>
                      {c.createdAt && (
                        <span className="text-[10px] text-text-light">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-text-light italic mt-0.5">"{c.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="font-semibold text-text block uppercase tracking-wider text-[11px]">
            Review Decision
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`flex items-center gap-2.5 p-3 border rounded-xl transition-all ${
                isApproveDisabled
                  ? 'border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed'
                  : reviewDecision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs cursor-pointer'
                    : 'border-border bg-surface text-text-light hover:text-text hover:border-emerald-500/50 cursor-pointer'
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-emerald-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === 'APPROVED'}
                disabled={isApproveDisabled}
                onChange={() => {
                  if (!isApproveDisabled) setReviewDecision('APPROVED');
                }}
              />
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold">Approve</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 border rounded-xl transition-all ${
                !isAssignedReviewer
                  ? 'border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed'
                  : reviewDecision === 'REJECTED'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-xs cursor-pointer'
                    : 'border-border bg-surface text-text-light hover:text-text hover:border-rose-500/50 cursor-pointer'
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-rose-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === 'REJECTED'}
                disabled={!isAssignedReviewer}
                onChange={() => {
                  if (isAssignedReviewer) setReviewDecision('REJECTED');
                }}
              />
              <XCircle size={16} className="text-rose-500 shrink-0" />
              <span className="text-xs font-semibold">Reject</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 border rounded-xl transition-all ${
                !isAssignedReviewer
                  ? 'border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed'
                  : reviewDecision === 'CHANGES_REQUESTED'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-xs cursor-pointer'
                    : 'border-border bg-surface text-text-light hover:text-text hover:border-amber-500/50 cursor-pointer'
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-amber-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === 'CHANGES_REQUESTED'}
                disabled={!isAssignedReviewer}
                onChange={() => {
                  if (isAssignedReviewer) setReviewDecision('CHANGES_REQUESTED');
                }}
              />
              <HelpCircle size={16} className="text-amber-500 shrink-0" />
              <span className="text-xs font-semibold">Request Changes</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-text block uppercase tracking-wider text-[11px]">
            Review Rationale / Feedback{' '}
            {reviewDecision !== 'APPROVED' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Enter governance feedback or decision rationale..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition"
            required={reviewDecision !== 'APPROVED'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            disabled={
              submitting ||
              !isAssignedReviewer ||
              (reviewDecision === 'APPROVED' && isSelfApprovalBlocked)
            }
          >
            {submitting ? 'Submitting...' : 'Submit Governance Decision'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// 3. Version Comparison Diff Modal
interface RoleCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareRole: Role | null;
  versions: any[];
  compareV1: number | '';
  setCompareV1: (val: number | '') => void;
  compareV2: number | '';
  setCompareV2: (val: number | '') => void;
  compareResult: any | null;
  onCompare: () => void;
}

export const RoleCompareModal: React.FC<RoleCompareModalProps> = ({
  isOpen,
  onClose,
  compareRole,
  versions,
  compareV1,
  setCompareV1,
  compareV2,
  setCompareV2,
  compareResult,
  onCompare,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      title={`Version Comparison Diff — ${compareRole?.name || ''}`}
      onClose={onClose}
      width="max-w-4xl"
    >
      <div className="space-y-4 text-xs text-text">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-text-light block mb-1.5 uppercase tracking-wider text-[11px]">
              Source Version (V1)
            </label>
            <select
              value={compareV1}
              onChange={(e) => setCompareV1(Number.parseInt(e.target.value || '0'))}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              <option value="">Select V1</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>
                  Version {v.version} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-text-light block mb-1.5 uppercase tracking-wider text-[11px]">
              Target Version (V2)
            </label>
            <select
              value={compareV2}
              onChange={(e) => setCompareV2(Number.parseInt(e.target.value || '0'))}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              <option value="">Select V2</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>
                  Version {v.version} ({v.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            leftIcon={ArrowLeftRight}
            onClick={onCompare}
            disabled={!compareV1 || !compareV2 || compareV1 === compareV2}
          >
            Compare Side-by-Side
          </Button>
        </div>

        {compareResult && (
          <div className="mt-4 border border-border rounded-2xl p-4 bg-background space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-xs">
                  + Added ({compareResult.diff?.added?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {compareResult.diff?.added?.map((k: string) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <span className="font-bold text-rose-600 dark:text-rose-400 block text-xs">
                  - Removed ({compareResult.diff?.removed?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {compareResult.diff?.removed?.map((k: string) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl border border-border bg-surface/50">
                <span className="font-bold text-text-light block text-xs">
                  = Retained ({compareResult.diff?.unchanged?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {compareResult.diff?.unchanged?.map((k: string) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-lg bg-surface border border-border text-[11px] text-text-light font-medium"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// 4. Assign Role to User Modal
interface RoleAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignRole: Role | null;
  assignableUsers: any[];
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  expiresAt: string;
  setExpiresAt: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const RoleAssignModal: React.FC<RoleAssignModalProps> = ({
  isOpen,
  onClose,
  assignRole,
  assignableUsers,
  selectedUserId,
  setSelectedUserId,
  expiresAt,
  setExpiresAt,
  onSubmit,
  submitting,
}) => {
  if (!isOpen) return null;

  const userOptions = assignableUsers.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.email})`,
  }));

  return (
    <Modal
      open={isOpen}
      title={`Assign Role — ${assignRole?.name || ''}`}
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs text-text">
        <div className="space-y-1.5">
          <label className="font-semibold text-text uppercase tracking-wider text-[11px] block">
            Select Administrator <span className="text-red-500">*</span>
          </label>
          <Select
            options={userOptions}
            value={userOptions.find((opt) => opt.value === selectedUserId) || null}
            onChange={(selected) => setSelectedUserId(selected?.value || '')}
            placeholder="Choose administrator user..."
            menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
            menuPosition="fixed"
            styles={customReactSelectStyles}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-text uppercase tracking-wider text-[11px] block">
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedUserId || submitting}>
            {submitting ? 'Assigning...' : 'Assign Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
