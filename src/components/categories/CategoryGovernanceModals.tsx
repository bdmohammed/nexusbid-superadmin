//@ts-nocheck
"use client";

import React from "react";
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "react-select";
import { Category } from "@/components/categories/CategoryFormDrawer";

// Reusable Custom Styles for react-select matching theme CSS variables
const customReactSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "var(--surface)",
    borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(99, 102, 241, 0.2)" : "none",
    borderRadius: "0.75rem",
    minHeight: "42px",
    fontSize: "0.75rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": {
      borderColor: "var(--border)",
    },
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 99999,
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  }),
  menuList: (base: any) => ({
    ...base,
    padding: "6px",
    maxHeight: "220px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
        ? "var(--background)"
        : "transparent",
    color: state.isSelected ? "#ffffff" : "var(--text)",
    fontSize: "0.75rem",
    borderRadius: "0.5rem",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    padding: "8px 12px",
    fontWeight: state.isSelected ? "600" : "500",
    "&:active": {
      backgroundColor: "var(--background)",
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "var(--text)",
    fontSize: "0.75rem",
    fontWeight: "500",
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    padding: "1px 4px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "var(--text)",
    fontSize: "0.75rem",
    fontWeight: "500",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "var(--text-light)",
    borderRadius: "0.25rem",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      color: "#ef4444",
    },
  }),
  input: (base: any) => ({
    ...base,
    color: "var(--text)",
    fontSize: "0.75rem",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "var(--text-light)",
    fontSize: "0.75rem",
  }),
};

// 1. Submit Review Modal
interface SubmitCategoryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  assignableUsers: any[];
  selectedReviewers: string[];
  setSelectedReviewers: (val: string[]) => void;
  reviewComment: string;
  setReviewComment: (val: string) => void;
  submitting: boolean;
  onSendForReview: () => void;
  currentUserId?: string;
}

export const SubmitCategoryReviewModal: React.FC<
  SubmitCategoryReviewModalProps
> = ({
  isOpen,
  onClose,
  category,
  assignableUsers,
  selectedReviewers,
  setSelectedReviewers,
  reviewComment,
  setReviewComment,
  submitting,
  onSendForReview,
  currentUserId,
}) => {
  if (!isOpen || !category) return null;

  const reviewerOptions = assignableUsers.map((u) => ({
    value: u.id,
    label: `${u.name || u.email} (${u.email})`,
    isDisabled: u.id === currentUserId && assignableUsers.length > 1,
  }));

  return (
    <Modal
      open={isOpen}
      title={`Submit Category for Review — ${category.name}`}
      onClose={onClose}
      width="max-w-xl"
    >
      <div className="space-y-4 text-xs text-text">
        <div className="p-3.5 bg-background border border-border rounded-xl space-y-1">
          <p className="font-semibold text-text flex items-center justify-between">
            <span>Target Category: {category.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Code: {category.code || "Auto-Gen"}
            </span>
          </p>
          <p className="text-text-light text-[11px]">
            Assign at least one administrator with category management
            permissions to evaluate and approve this category version.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Select Governance Reviewer(s){" "}
            <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={reviewerOptions}
            value={reviewerOptions.filter((opt) =>
              selectedReviewers.includes(opt.value),
            )}
            onChange={(selected) =>
              setSelectedReviewers(selected.map((s) => s.value))
            }
            placeholder="Search and select reviewer..."
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : undefined
            }
            menuPosition="fixed"
            styles={customReactSelectStyles}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Submission Context / Release Notes
          </label>
          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Provide context or instructions for reviewers..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onSendForReview}
            disabled={selectedReviewers.length === 0 || submitting}
          >
            {submitting ? "Submitting..." : "Send to Reviewers"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 2. Review Decision Modal
interface CategoryReviewDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  reviewDecision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  setReviewDecision: (val: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => void;
  decisionComment: string;
  setDecisionComment: (val: string) => void;
  submitting: boolean;
  onSubmitReview: (e?: React.FormEvent) => void;
  currentUserId?: string;
  creatorId?: string;
  reviewDetails?: any;
  assignableUsers?: any[];
}

export const CategoryReviewDecisionModal: React.FC<
  CategoryReviewDecisionModalProps
> = ({
  isOpen,
  onClose,
  category,
  reviewDecision,
  setReviewDecision,
  decisionComment,
  setDecisionComment,
  submitting,
  onSubmitReview,
  currentUserId,
  creatorId: propCreatorId,
  reviewDetails,
  assignableUsers = [],
}) => {
  if (!isOpen || !category) return null;

  // 1. Check if current user is an assigned reviewer
  const assignments =
    reviewDetails?.categoryReviewAssignments ||
    reviewDetails?.assignments ||
    [];

  const reviewerIds: string[] = assignments
    .map((a: any) => a.reviewerId || a.reviewer?.id)
    .filter(Boolean);

  const isAssignedReviewer =
    reviewerIds.length === 0 ||
    (Boolean(currentUserId) && reviewerIds.includes(currentUserId!));

  // 2. Check Maker-Checker creator self-approval rule
  const creatorId =
    propCreatorId ||
    category?.createdByUserId ||
    (category as any)?.createdBy ||
    reviewDetails?.createdByUserId;

  const isCreator = Boolean(
    currentUserId && creatorId && currentUserId === creatorId,
  );
  const otherAdmins = assignableUsers.filter((u) => u.id !== currentUserId);
  const hasOtherAdmins = otherAdmins.length > 0;
  const isSelfApprovalBlocked = isCreator && hasOtherAdmins;

  const isApproveDisabled = !isAssignedReviewer || isSelfApprovalBlocked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(e);
  };

  const commentsHistory =
    reviewDetails?.comments || (category as any)?.comments || [];

  return (
    <Modal
      open={isOpen}
      title={`Review Approval Console — ${category.name}`}
      onClose={onClose}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-text">
        {!isAssignedReviewer && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Not an Assigned Reviewer</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                You are not an assigned reviewer for this category draft. Only
                designated assigned reviewers can execute a review decision on
                this draft.
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
                You created this category draft. Maker-Checker policy prevents
                self-approval when another administrator with category
                management permission exists in the system. Another
                administrator must review and approve this draft.
              </p>
            </div>
          </div>
        )}

        {commentsHistory && commentsHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-text-light uppercase tracking-wider text-[11px]">
              Comments & Evaluation History
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-xl p-3 bg-background">
              {commentsHistory.map((c: any) => (
                <div
                  key={c.id || c.createdAt}
                  className="flex gap-2.5 items-start border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-text">
                        {c.user?.name || c.userName || "Governance Reviewer"}
                      </p>
                      {c.createdAt && (
                        <span className="text-[10px] text-text-light">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-text-light italic mt-0.5">
                      "{c.comment}"
                    </p>
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
                  ? "border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed"
                  : reviewDecision === "APPROVE"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs cursor-pointer"
                    : "border-border bg-surface text-text-light hover:text-text hover:border-emerald-500/50 cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-emerald-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === "APPROVE"}
                disabled={isApproveDisabled}
                onChange={() => {
                  if (!isApproveDisabled) setReviewDecision("APPROVE");
                }}
              />
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold">Approve</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 border rounded-xl transition-all ${
                !isAssignedReviewer
                  ? "border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed"
                  : reviewDecision === "REJECT"
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-xs cursor-pointer"
                    : "border-border bg-surface text-text-light hover:text-text hover:border-rose-500/50 cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-rose-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === "REJECT"}
                disabled={!isAssignedReviewer}
                onChange={() => {
                  if (isAssignedReviewer) setReviewDecision("REJECT");
                }}
              />
              <XCircle size={16} className="text-rose-500 shrink-0" />
              <span className="text-xs font-semibold">Reject</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 border rounded-xl transition-all ${
                !isAssignedReviewer
                  ? "border-border bg-surface/50 text-text-light opacity-60 cursor-not-allowed"
                  : reviewDecision === "REQUEST_CHANGES"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-xs cursor-pointer"
                    : "border-border bg-surface text-text-light hover:text-text hover:border-amber-500/50 cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="accent-amber-600 h-4 w-4 cursor-pointer"
                checked={reviewDecision === "REQUEST_CHANGES"}
                disabled={!isAssignedReviewer}
                onChange={() => {
                  if (isAssignedReviewer) setReviewDecision("REQUEST_CHANGES");
                }}
              />
              <HelpCircle size={16} className="text-amber-500 shrink-0" />
              <span className="text-xs font-semibold">Request Changes</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-text block uppercase tracking-wider text-[11px]">
            Review Rationale / Feedback{" "}
            {reviewDecision !== "APPROVE" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            rows={3}
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
            placeholder="Enter governance feedback or decision rationale..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition"
            required={reviewDecision !== "APPROVE"}
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
              (reviewDecision === "APPROVE" && isSelfApprovalBlocked) ||
              (reviewDecision !== "APPROVE" && !decisionComment.trim())
            }
          >
            {submitting ? "Submitting..." : "Submit Governance Decision"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
