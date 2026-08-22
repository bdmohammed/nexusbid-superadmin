"use client";

import React, { useEffect,useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  FolderGit2,
  Layers,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/http";

interface ReviewModalProps {
  requestId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewRequestModal: React.FC<ReviewModalProps> = ({
  requestId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchDetails();
    }
  }, [isOpen, requestId]);

  const fetchDetails = async (showFullLoading = true) => {
    if (!requestId) return;
    if (showFullLoading) setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any>(
        `/countries/change-requests/${requestId}`,
      );
      if (res.data?.success) {
        setDetails(res.data.data);
      } else {
        setError(res.data?.message || "Failed to fetch request details.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch request details.",
      );
    } finally {
      if (showFullLoading) setLoading(false);
    }
  };

  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!requestId) return;
    setSubmittingReview(true);
    setError(null);
    try {
      const res = await apiClient.post<any>(
        `/countries/change-requests/${requestId}/review`,
        {
          action,
          comment: reviewComment || undefined,
        },
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Failed to process review decision",
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process review decision",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !requestId) return;
    setSubmittingComment(true);
    try {
      const res = await apiClient.post<any>(
        `/countries/change-requests/${requestId}/comments`,
        {
          type: "REVIEW",
          content: newComment,
        },
      );

      if (res.data?.success) {
        setNewComment("");
        fetchDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen || !requestId) return null;

  const dep = details?.dependencyMatrix || {};
  const isClosed =
    details?.status === "APPROVED" ||
    details?.status === "REJECTED" ||
    details?.status === "CANCELLED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl p-6 shadow-2xl text-text max-h-[92vh] overflow-y-auto">
        {loading ? (
          <div className="py-20 text-center text-text-light">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            Loading Change Request Details & Impact Analysis...
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold">
                    {details.requestNumber}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-text-light">
                    {details.targetType} Change Request
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      details.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : details.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {details.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-text mt-2">
                  Proposed Action:{" "}
                  <span
                    className={
                      details.action === "DEACTIVATE"
                        ? "text-rose-500"
                        : "text-emerald-500"
                    }
                  >
                    {details.action}
                  </span>{" "}
                  {details.country?.name}{" "}
                  {details.state ? `(${details.state.name})` : ""}
                </h2>
                <p className="text-xs text-text-light mt-1">
                  Requested by:{" "}
                  <span className="text-text font-medium">
                    {details.requestedBy?.fullName}
                  </span>{" "}
                  • {new Date(details.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-text-light hover:text-text p-1 rounded-lg hover:bg-background transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Business Reason */}
            <div className="p-4 bg-background rounded-xl border border-border">
              <span className="text-xs font-semibold text-text-light uppercase tracking-wider block mb-1">
                Business Reason & Rationale
              </span>
              <p className="text-sm text-text font-medium">{details.reason}</p>
            </div>

            {/* 11-Field Operational Dependency Impact Analysis Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Operational Dependency Impact Matrix
                </h3>
                <span className="text-xs text-text-light">
                  Pre-Approval Risk & Impact Assessment
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Users
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.users || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />{" "}
                    Companies
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.companies || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <FileText className="w-3.5 h-3.5 text-amber-500" /> Total
                    Tenders
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.tenders || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-text-light" /> Draft
                    Tenders
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.draftTenders || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                    Published Tenders
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.publishedTenders || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />{" "}
                    Categories
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.categories || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" /> Child States
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.states || 0}
                  </span>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-text-light text-xs mb-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-rose-500" />{" "}
                    Documents
                  </div>
                  <span className="text-lg font-bold text-text">
                    {dep.documents || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Review
                  Discussion Thread ({details.comments?.length || 0})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {!details.comments || details.comments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-background/50 text-center">
                    <p className="text-xs text-text-light italic">
                      No discussion comments yet. Add notes or questions below.
                    </p>
                  </div>
                ) : (
                  details.comments.map((c: any) => (
                    <div
                      key={c.id}
                      className="bg-background p-3 rounded-xl border border-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-text-light">
                        <div className="flex items-center gap-1.5 font-semibold text-text">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {c.author?.name ||
                              c.author?.fullName ||
                              c.author?.email ||
                              "Administrator"}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-light">
                          {new Date(c.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-text leading-relaxed pl-5">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {!isClosed && (
                <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a comment or response for the audit thread..."
                    className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:border-primary placeholder:text-text-light transition"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    leftIcon={Send}
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? "Posting..." : "Post"}
                  </Button>
                </form>
              )}
            </div>

            {/* Decision Action Area */}
            {!isClosed && (
              <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Reviewer Notes / Feedback (Optional)
                </label>
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter decision rationale for audit trail..."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-text focus:outline-none focus:border-primary placeholder:text-text-light"
                />
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleReview("REJECT")}
                    disabled={submittingReview}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview("APPROVE")}
                    disabled={submittingReview}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Execute
                    Cascade
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
