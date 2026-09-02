'use client';

import dayjs from 'dayjs';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Send,
  Shield,
  User,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';

import type { UserRoleAssignment } from '@/features/rbac/types';
import Button from '@/components/ui/Button';

interface RoleAssignmentDetailsModalProps {
  assignment: UserRoleAssignment | null;
  onClose: () => void;
  onSubmitForReview: (assignment: UserRoleAssignment) => void;
  onApproveAssignment: (assignment: UserRoleAssignment) => void;
  onRejectAssignment: (assignment: UserRoleAssignment) => void;
}

export default function RoleAssignmentDetailsModal({
  assignment,
  onClose,
  onSubmitForReview,
  onApproveAssignment,
  onRejectAssignment,
}: RoleAssignmentDetailsModalProps) {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">Role Assignment Details</h3>
              <p className="text-xs text-text-light">Maker-Checker Governance Audit Record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-light hover:bg-surface-hover hover:text-text cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-4 text-xs">
          {/* User Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-border">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="font-bold text-text">{assignment.user?.name || 'Unknown User'}</p>
                <p className="text-[11px] text-text-light">{assignment.user?.email || 'N/A'}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
              {assignment.role?.name || 'No Role'}
            </span>
          </div>

          {/* Status & Reviewer Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-hover/30 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Governance Status
              </span>
              <p className="font-bold text-text uppercase">{assignment.status || 'ACTIVE'}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-hover/30 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-purple-500" /> Assigned Reviewer
              </span>
              <p className="font-bold text-text truncate">
                {assignment.reviewer?.name || assignment.reviewer?.email || 'Not Assigned'}
              </p>
            </div>
          </div>

          {/* Timestamps Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-hover/30 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Effective From
              </span>
              <p className="font-medium text-text">
                {assignment.effectiveAt
                  ? dayjs(assignment.effectiveAt).format('DD MMM YYYY, hh:mm A')
                  : 'Immediate'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-hover/30 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Expires At
              </span>
              <p className="font-medium text-text">
                {assignment.expiresAt
                  ? dayjs(assignment.expiresAt).format('DD MMM YYYY, hh:mm A')
                  : 'Permanent Access'}
              </p>
            </div>
          </div>

          {/* Reason & Comment */}
          <div className="p-3 rounded-xl bg-surface-hover/30 border border-border space-y-2">
            <div>
              <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-text-light" /> Reason / Justification
              </span>
              <p className="font-medium text-text mt-0.5">
                {assignment.reason || 'No reason provided.'}
              </p>
            </div>
            {assignment.comment && (
              <div className="pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-text-light flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-text-light" /> Governance Comment
                </span>
                <p className="font-medium text-text mt-0.5">{assignment.comment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {assignment.status === 'DRAFT' && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={Send}
                onClick={() => onSubmitForReview(assignment)}
              >
                Submit Review
              </Button>
            )}
            {(assignment.status === 'SUBMITTED' ||
              assignment.status === 'PENDING_APPROVAL' ||
              assignment.status === 'IN_REVIEW') && (
              <>
                <Button
                  size="sm"
                  leftIcon={CheckCircle2}
                  onClick={() => onApproveAssignment(assignment)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  leftIcon={XCircle}
                  onClick={() => onRejectAssignment(assignment)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
