//@ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, ShieldCheck, Users } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { rbacApi } from '@/features/rbac/api/api';
import { tenderApi } from '@/features/tenders/api/api';

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
    '&:hover': { borderColor: 'var(--border)' },
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 99999 }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  }),
  menuList: (base: any) => ({ ...base, padding: '6px', maxHeight: '220px' }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
        ? 'rgba(99, 102, 241, 0.1)'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--text)',
    fontSize: '0.75rem',
    borderRadius: '0.5rem',
    padding: '8px 12px',
    cursor: 'pointer',
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '0.5rem',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'var(--primary)',
    fontSize: '0.75rem',
    fontWeight: 600,
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'var(--primary)',
    '&:hover': { backgroundColor: 'var(--primary)', color: '#ffffff' },
  }),
};

interface TenderSubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  onSuccess?: () => void;
}

export const TenderSubmitReviewModal: React.FC<TenderSubmitReviewModalProps> = ({
  isOpen,
  onClose,
  tenderId,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState<any[]>([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [reviewerOptions, setReviewerOptions] = useState<any[]>([]);

  // Fetch assignable reviewers from backend API
  useEffect(() => {
    if (!isOpen) return;
    async function loadAssignableReviewers() {
      try {
        const res = await rbacApi.getAssignableUsers({
          accountType: 'admin',
          status: 'active',
          permission: 'tender.manage',
          limit: 100,
        });
        const rawUsers = (res.data?.success && res.data?.data) || [];
        const activeVerifiedAdmins = rawUsers.filter((u: any) => {
          const isAdminType =
            u.accountType === 'admin' || u.accountType === 'system_admin' || u.role === 'admin';
          const isActive =
            (u.status?.toLowerCase() === 'active' || u.isActive === true) && !u.isBlocked;
          const isVerified = u.emailVerified !== false && u.isVerified !== false;
          return isAdminType && isActive && isVerified;
        });

        const options = activeVerifiedAdmins.map((u: any) => ({
          value: u.id,
          label: `${u.fullName || u.name || u.email} (${u.email})`,
        }));
        setReviewerOptions(options);
      } catch (err) {
        console.warn('Failed to load assignable reviewers from API:', err);
      }
    }
    loadAssignableReviewers();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!tenderId) return;
    setSubmitting(true);
    const toastId = toast.loading('Submitting tender for governance review...');

    try {
      // 1. Submit tender for review
      const res = await tenderApi.submitForReview(tenderId);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to submit draft for review');
      }

      // 2. Assign selected reviewers if specified
      if (selectedReviewers.length > 0) {
        const reviewerIds = selectedReviewers.map((r) => r.value);
        await tenderApi.assignReviewers(tenderId, { reviewerIds });
      }

      // 3. Attach submission rationale comment if specified
      if (submissionNote.trim()) {
        const reviewsRes = await tenderApi.getReviews(tenderId);
        const activeReview = reviewsRes.data?.data?.[0];
        if (activeReview?.id) {
          await tenderApi.submitReviewComment(activeReview.id, {
            commentText: `[Submission Note] ${submissionNote}`,
          });
        }
      }

      toast.success('Tender Version Submitted for Governance Review!', {
        id: toastId,
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Submit Tender Draft for Governance Review">
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-primary block">
              Maker-Checker Governance Workflow Initiated
            </span>
            <p className="text-text-light leading-relaxed">
              Submitting this draft locks editing until assigned compliance reviewers audit the
              parameters, S3 documents, and commercial terms.
            </p>
          </div>
        </div>

        {/* Reviewer Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> Assign Designated Compliance Reviewers
            </span>
            <span className="text-[11px] text-text-light font-normal">Optional</span>
          </label>
          <Select
            isMulti
            options={reviewerOptions}
            value={selectedReviewers}
            onChange={(val: any) => setSelectedReviewers(val || [])}
            placeholder="Select compliance officers / auditors..."
            styles={customReactSelectStyles}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          />
        </div>

        {/* Submission Note / Rationale */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" /> Maker Submission Note / Rationale
          </label>
          <textarea
            rows={3}
            value={submissionNote}
            onChange={(e) => setSubmissionNote(e.target.value)}
            placeholder="Provide context, special conditions, or key highlights for the reviewers..."
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-text focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button leftIcon={Send} onClick={handleSubmit} isLoading={submitting}>
            Confirm Governance Submission
          </Button>
        </div>
      </div>
    </Modal>
  );
};
