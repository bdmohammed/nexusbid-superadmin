"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  AlertCircle,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import ReactSelect, { SingleValue } from "react-select";
import { apiClient } from "@/lib/http";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useThemeStore } from "@/store/theme.store";

interface Reviewer {
  id: string;
  fullName: string;
  email: string;
  isSelf: boolean;
  canBeAssigned: boolean;
}

interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTargetType?: "COUNTRY" | "STATE";
  initialCountryId?: string;
  initialStateId?: string;
  initialAction?: "ACTIVATE" | "DEACTIVATE";
  countryName?: string;
  stateName?: string;
}

export const CreateChangeRequestModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTargetType = "COUNTRY",
  initialCountryId = "",
  initialStateId = "",
  initialAction = "DEACTIVATE",
  countryName = "",
  stateName = "",
}) => {
  const [targetType, setTargetType] =
    useState<"COUNTRY" | "STATE">(initialTargetType);
  const [countryId, setCountryId] = useState(initialCountryId);
  const [stateId, setStateId] = useState(initialStateId);
  const [action, setAction] =
    useState<"ACTIVATE" | "DEACTIVATE">(initialAction);
  const [reason, setReason] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cascade Policy Options
  const [cascadePolicy, setCascadePolicy] = useState({
    disableStates: true,
    disableTenders: true,
    disableCategories: false,
    hideFromSearch: true,
    notifySuppliers: true,
  });

  useEffect(() => {
    if (isOpen) {
      setTargetType(initialTargetType);
      setCountryId(initialCountryId);
      setStateId(initialStateId);
      setAction(initialAction);
      setError(null);
      fetchEligibleReviewers();
    }
  }, [
    isOpen,
    initialTargetType,
    initialCountryId,
    initialStateId,
    initialAction,
  ]);

  const currentTheme = useThemeStore((state) => state.theme);
  const isDark = currentTheme === "dark";

  const reviewerOptions = useMemo<SelectOption[]>(() => {
    return reviewers.map((r) => {
      let suffix = "";
      if (r.isSelf) {
        suffix = r.canBeAssigned
          ? " — (Self-Assign — Sole Country Admin)"
          : " — (Self - Disabled by Rule 1)";
      }
      return {
        value: r.id,
        label: `${r.fullName} (${r.email})${suffix}`,
        isDisabled: !r.canBeAssigned,
      };
    });
  }, [reviewers]);

  const selectedReviewerOption =
    reviewerOptions.find((o) => o.value === reviewerId) || null;

  const selectStyles = useMemo(
    () => ({
      control: (base: any, state: any) => ({
        ...base,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: state.isFocused
          ? "var(--color-primary, #6366f1)"
          : isDark
            ? "#374151"
            : "#e5e7eb",
        borderRadius: "0.75rem",
        padding: "2px 4px",
        boxShadow: state.isFocused
          ? "0 0 0 2px rgba(99, 102, 241, 0.2)"
          : "none",
        "&:hover": {
          borderColor: "var(--color-primary, #6366f1)",
        },
      }),
      menu: (base: any) => ({
        ...base,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderRadius: "0.75rem",
        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "var(--color-primary, #6366f1)"
          : state.isFocused
            ? isDark
              ? "#1f2937"
              : "rgba(99, 102, 241, 0.08)"
            : "transparent",
        color: state.isSelected ? "#ffffff" : isDark ? "#f3f4f6" : "#1f2937",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        opacity: state.isDisabled ? 0.5 : 1,
        fontSize: "0.75rem",
      }),
      singleValue: (base: any) => ({
        ...base,
        color: isDark ? "#f3f4f6" : "#1f2937",
        fontSize: "0.75rem",
      }),
      input: (base: any) => ({
        ...base,
        color: isDark ? "#f3f4f6" : "#1f2937",
        fontSize: "0.75rem",
      }),
      placeholder: (base: any) => ({
        ...base,
        color: isDark ? "#9ca3af" : "#6b7280",
        fontSize: "0.75rem",
      }),
    }),
    [isDark]
  );

  const fetchEligibleReviewers = async () => {
    setLoadingReviewers(true);
    try {
      const res = await apiClient.get<any>("/countries/eligible-reviewers");
      if (res.data?.success) {
        setReviewers(res.data.data);
        const autoSelect = res.data.data.find(
          (r: Reviewer) => r.canBeAssigned
        );
        if (autoSelect) setReviewerId(autoSelect.id);
      }
    } catch (err: any) {
      console.error("Failed to load eligible reviewers", err);
    } finally {
      setLoadingReviewers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 10) {
      setError(
        "Please provide a business justification (at least 10 characters)."
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const createRes = await apiClient.post<any>(
        "/countries/change-requests",
        {
          targetType,
          countryId,
          stateId: targetType === "STATE" ? stateId : undefined,
          action,
          reason,
          cascadePolicy,
        }
      );

      if (!createRes.data?.success) {
        throw new Error(
          createRes.data?.message || "Failed to create change request ticket"
        );
      }

      const requestId = createRes.data.data.id;

      if (reviewerId) {
        await apiClient.post(
          `/countries/change-requests/${requestId}/assign`,
          {
            reviewerId,
          }
        );
      }

      toast.success("Governance change request submitted successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "An error occurred during submission."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title = `Propose ${action === "ACTIVATE" ? "Activation" : "Deactivation"} Request`;

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={submitting}
        leftIcon={submitting ? RefreshCw : Send}
      >
        {submitting ? "Submitting Ticket..." : "Submit Proposal"}
      </Button>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      title={title}
      onClose={onClose}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Target Summary Banner */}
        <div className="p-4 rounded-2xl bg-background border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-light uppercase tracking-wider">
              Governance Target Entity
            </h4>
            <p className="text-sm font-bold text-text mt-0.5">
              {countryName} {stateName ? `→ ${stateName}` : ""}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proposed Operation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              Proposed Operation
            </label>
            {action === "DEACTIVATE" ? (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500 shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-text">
                      Deactivate {targetType === "STATE" ? "State" : "Country"}
                    </h5>
                    <p className="text-xs text-text-light mt-0.5">
                      Do you want to deactivate{" "}
                      <span className="font-semibold text-text">
                        {stateName || countryName}
                      </span>
                      ? This will restrict operational availability.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-500 border border-rose-500/30 shrink-0">
                  Deactivation
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-text">
                      Activate {targetType === "STATE" ? "State" : "Country"}
                    </h5>
                    <p className="text-xs text-text-light mt-0.5">
                      Do you want to activate{" "}
                      <span className="font-semibold text-text">
                        {stateName || countryName}
                      </span>
                      ? This will enable entity for production tenders.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0">
                  Activation
                </span>
              </div>
            )}
          </div>

          {/* Assign Reviewer */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              Assign Reviewer{" "}
              <span className="text-text-light font-normal text-[11px] lowercase">
                (maker-checker enforced)
              </span>
            </label>
            {loadingReviewers ? (
              <div className="flex items-center gap-2 text-xs text-text-light py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                Loading eligible reviewers...
              </div>
            ) : (
              <ReactSelect
                options={reviewerOptions}
                value={selectedReviewerOption}
                onChange={(option: SingleValue<SelectOption>) =>
                  setReviewerId(option?.value || "")
                }
                placeholder="Search or select an assigned reviewer..."
                styles={selectStyles}
                isSearchable
                isClearable
              />
            )}
          </div>

          {/* Business Reason */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              Business Justification / Rationale{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide clear rationale for auditors (e.g. Regional procurement operations suspended)..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text placeholder:text-text-light resize-none"
            />
          </div>

          {/* Cascading Impact System Note */}
          {action === "DEACTIVATE" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-amber-700 dark:text-amber-400">
                <Info className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Cascading System Impact</span>
              </div>
              <p className="text-xs text-text-light leading-relaxed">
                {targetType === "COUNTRY"
                  ? "Deactivating this country will automatically disable all child states/territories and associated active tenders. They will be hidden from customer search filters while remaining visible on the admin portal."
                  : "Deactivating this state/territory/federal region will automatically disable associated active tenders. State-level items will be hidden from customer search filters while remaining visible on the admin portal."}
              </p>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
