//@ts-nocheck
"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  DollarSign,
  Briefcase,
  Globe,
  Tag,
  Users,
  History,
  FileText,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Play,
  Sparkles,
  Lock,
  Send,
  CheckCircle2,
  MessageSquare,
  Plus,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/common/StatusBadge";
import { rbacApi } from "@/features/rbac/api/api";
import {
  usePlanDetails,
  useCouponsList,
  useAdminSubscriptions,
  useCreatePlanVersionDraft,
  useSubmitPlanForReview,
  usePublishPlanVersion,
  useAssignPlanReviewer,
  useSubmitPlanReviewAction,
  useInitiateSubscriptionMigration,
} from "@/features/subscriptions";

type TabName =
  | "overview"
  | "pricing"
  | "features"
  | "restrictions"
  | "countries"
  | "categories"
  | "coupons"
  | "subscribers"
  | "history"
  | "review";

export default function PlanWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [selectedTargetVersion, setSelectedTargetVersion] =
    useState<string>("");
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [reviewComment, setReviewComment] = useState("");
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    async function loadAssignableUsers() {
      setUsersLoading(true);
      try {
        const res = await rbacApi.getAssignableUsers({
          accountType: "admin",
          status: "active",
          permission: "billing.manage",
          limit: 100,
        });
        const rawUsers = (res.data?.success && res.data?.data) || [];
        setAssignableUsers(rawUsers);
      } catch (err) {
        console.error(
          "Failed to load assignable users for reviewer selection:",
          err,
        );
      } finally {
        setUsersLoading(false);
      }
    }
    loadAssignableUsers();
  }, []);

  // Real API Queries
  const {
    data: plan,
    isLoading: planLoading,
    refetch: refetchPlan,
  } = usePlanDetails(planId);
  const { data: coupons = [], isLoading: couponsLoading } = useCouponsList();
  const { data: subscriptionsResp, isLoading: subscribersLoading } =
    useAdminSubscriptions(1, 100);

  // Real API Mutations
  const createVersionMutation = useCreatePlanVersionDraft();
  const submitReviewMutation = useSubmitPlanForReview();
  const assignReviewerMutation = useAssignPlanReviewer();
  const publishVersionMutation = usePublishPlanVersion();
  const reviewActionMutation = useSubmitPlanReviewAction();
  const migrateMutation = useInitiateSubscriptionMigration();

  // Active Version reference
  const activeVersion = useMemo(() => {
    if (!plan) return null;
    return (
      plan.activeVersion ||
      (plan.versions && plan.versions.length > 0 ? plan.versions[0] : null)
    );
  }, [plan]);

  const versionStatus = activeVersion?.status || "DRAFT";
  const isPublished = versionStatus === "PUBLISHED";
  const isApproved = versionStatus === "APPROVED";
  const isDraft = versionStatus === "DRAFT";
  const isUnderReview =
    versionStatus === "SUBMITTED" || versionStatus === "UNDER_REVIEW";

  // Active Subscribers for this specific Plan
  const planSubscribers = useMemo(() => {
    if (!subscriptionsResp?.data || !isPublished) return [];
    return subscriptionsResp.data.filter(
      (sub) => sub.planId === planId || sub.plan?.id === planId,
    );
  }, [subscriptionsResp, planId, isPublished]);

  // Dynamic Features List
  const featureList = useMemo(() => {
    if (!activeVersion?.features) return [];
    if (Array.isArray(activeVersion.features)) {
      return activeVersion.features.map((f: any) => ({
        key: f.featureKey || f.key || f.name || "Feature",
        value: f.limitValue || f.value || "Included",
      }));
    }
    return Object.entries(activeVersion.features).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }, [activeVersion]);

  // Country Pricing Overrides
  const countryPricingList = useMemo(() => {
    if (
      activeVersion?.countryPricing &&
      activeVersion.countryPricing.length > 0
    ) {
      return activeVersion.countryPricing;
    }
    if (activeVersion?.targetCountry) {
      return [
        {
          id: "target",
          country: activeVersion.targetCountry,
          currency: activeVersion.currency || "USD",
          priceCents: activeVersion.priceCents || 0,
        },
      ];
    }
    return [];
  }, [activeVersion]);

  // Category Pricing Overrides
  const categoryPricingList = useMemo(() => {
    if (
      activeVersion?.categoryPricing &&
      activeVersion.categoryPricing.length > 0
    ) {
      return activeVersion.categoryPricing;
    }
    if (activeVersion?.targetCategoryId) {
      return [
        {
          id: "cat_target",
          categoryId: activeVersion.targetCategoryId,
          priceCents: activeVersion.priceCents || 0,
        },
      ];
    }
    return [];
  }, [activeVersion]);

  // Active Reviews
  const activeReview = useMemo(() => {
    if (!plan?.versions) return null;
    for (const v of plan.versions) {
      if (v.reviews && v.reviews.length > 0) {
        return v.reviews[0];
      }
    }
    return null;
  }, [plan]);

  // Handle Submit for Review
  async function handleSubmitForReview() {
    if (!activeVersion?.id) return;
    try {
      await submitReviewMutation.mutateAsync(activeVersion.id);
      toast.success("Plan version submitted for maker-checker review!");
      refetchPlan();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit plan for review");
    }
  }

  // Handle Assign Reviewer
  async function handleAssignReviewer() {
    if (!activeReview?.id) {
      toast.error(
        "No pending review record found. Submit plan for review first.",
      );
      return;
    }
    if (!selectedReviewerId) {
      toast.error("Please select a reviewer admin");
      return;
    }
    try {
      await assignReviewerMutation.mutateAsync({
        reviewId: activeReview.id,
        input: { reviewerId: selectedReviewerId },
      });
      toast.success("Reviewer assigned successfully!");
      refetchPlan();
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign reviewer");
    }
  }

  // Handle Publish Plan Version
  async function handlePublishVersion() {
    if (!activeVersion?.id) return;
    try {
      await publishVersionMutation.mutateAsync(activeVersion.id);
      toast.success(
        "Plan version published successfully! Now live for vendors.",
      );
      refetchPlan();
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish plan version");
    }
  }

  // Handle Version Draft Creation
  async function handleCreateVersionDraft() {
    if (!activeVersion) return;
    try {
      await createVersionMutation.mutateAsync({
        id: planId,
        input: { price: (activeVersion.priceCents || 0) / 100 },
      });
      toast.success("New draft version created!");
      refetchPlan();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create version draft");
    }
  }

  // Handle Review Action (Approve / Reject)
  async function handleReviewAction(action: "APPROVE" | "REJECT") {
    if (!activeReview?.id) {
      toast.error("No active review found for this plan version");
      return;
    }
    try {
      await reviewActionMutation.mutateAsync({
        reviewId: activeReview.id,
        input: { action, comment: reviewComment },
      });
      toast.success(
        `Plan version ${action === "APPROVE" ? "approved" : "changes requested"}!`,
      );
      setReviewComment("");
      refetchPlan();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review action");
    }
  }

  // Handle Batch Migration
  async function handleBatchMigration() {
    if (!selectedTargetVersion) {
      toast.error("Please select a target approved version");
      return;
    }
    try {
      await migrateMutation.mutateAsync({
        sourcePlanId: planId,
        targetPlanId: selectedTargetVersion,
      });
      toast.success("Subscription migration initiated successfully!");
      setMigrationOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate migration");
    }
  }

  const tabsList: { name: TabName; label: string; icon: any }[] = [
    { name: "overview", label: "Overview", icon: FileText },
    { name: "pricing", label: "Pricing", icon: DollarSign },
    { name: "features", label: "Features", icon: Layers },
    { name: "restrictions", label: "Restrictions", icon: ShieldAlert },
    { name: "countries", label: "Countries", icon: Globe },
    { name: "categories", label: "Categories", icon: Briefcase },
    { name: "coupons", label: "Coupons", icon: Tag },
    { name: "subscribers", label: "Subscribers", icon: Users },
    { name: "history", label: "Audit History", icon: History },
    { name: "review", label: "Review Board", icon: CheckCircle },
  ];

  if (planLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-border/40 animate-pulse rounded-2xl" />
        <div className="h-12 bg-border/40 animate-pulse rounded-2xl" />
        <div className="h-96 bg-border/40 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-surface">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-text">Plan Not Found</h2>
        <p className="text-xs text-text-light mt-1">
          The plan with ID <code className="text-primary">{planId}</code> does
          not exist or was removed.
        </p>
        <Link
          href="/subscriptions?view=plan-list"
          className="mt-4 inline-block"
        >
          <Button variant="outline" size="sm">
            Back to Plans
          </Button>
        </Link>
      </div>
    );
  }

  const planName = activeVersion?.name || plan.name || "Plan Workspace";
  const planRefCode =
    plan.referenceNo || `PLN-${plan.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Unpublished Status Banner */}
      {!isPublished && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider">
                Plan Version v{activeVersion?.version || 1} is {versionStatus}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {isDraft &&
                  "This draft version is currently under setup and has not been submitted for review."}
                {isUnderReview &&
                  "This plan version is currently pending reviewer approval on the Review Board."}
                {isApproved &&
                  "This plan version has been approved and is ready to publish to live vendors."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDraft && (
              <Button
                size="sm"
                leftIcon={Send}
                onClick={handleSubmitForReview}
                disabled={submitReviewMutation.isPending}
                className="text-xs font-bold py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit for Review"}
              </Button>
            )}

            {isUnderReview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("review")}
                className="text-xs font-bold py-1.5 px-3 border-amber-500/40 text-amber-600 dark:text-amber-400"
              >
                Open Review Board
              </Button>
            )}

            {isApproved && (
              <Button
                size="sm"
                leftIcon={CheckCircle2}
                onClick={handlePublishVersion}
                disabled={publishVersionMutation.isPending}
                className="text-xs font-bold py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {publishVersionMutation.isPending
                  ? "Publishing..."
                  : "Publish Version"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-5 rounded-2xl bg-surface border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/subscriptions?view=plan-list"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-secondary text-text-light hover:text-text hover:bg-border/40 transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-text">
                {planName}
              </h1>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-mono font-bold text-primary">
                {planRefCode}
              </span>
              <StatusBadge status={isPublished ? "Active" : versionStatus} />
            </div>

            <p className="text-xs text-text-light mt-1 flex items-center gap-1.5">
              <span>Aggregate Root ID:</span>
              <code className="text-primary font-mono text-[11px] font-semibold">
                {plan.id}
              </code>
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMigrationOpen(true)}
            disabled={!isPublished || planSubscribers.length === 0}
            title={
              !isPublished
                ? "Plan must be published to migrate subscribers"
                : ""
            }
            className="text-xs py-2 px-3.5 h-10 font-semibold rounded-xl disabled:opacity-50"
          >
            Migrate Subscribers
          </Button>

          <Button
            size="sm"
            onClick={handleCreateVersionDraft}
            disabled={createVersionMutation.isPending}
            className="text-xs py-2 px-3.5 h-10 font-semibold rounded-xl"
          >
            {createVersionMutation.isPending
              ? "Creating..."
              : "Create Version Draft"}
          </Button>
        </div>
      </div>

      {/* Tabs Segmented Switcher Bar */}
      <div className="flex overflow-x-auto p-1.5 rounded-2xl border border-border bg-surface-secondary gap-1 scrollbar-none">
        {tabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-light hover:text-text hover:bg-surface/50"
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {tab.name === "subscribers" && !isPublished && (
                <Lock size={12} className="opacity-60 text-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs min-h-[420px]">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <div className="space-y-5 rounded-2xl border border-border bg-surface-secondary/40 p-5">
                <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Basic Configuration
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-light font-medium">
                      Active Version
                    </span>
                    <p className="font-bold text-text text-sm mt-1">
                      v{activeVersion?.version || 1}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-light font-medium">
                      Version Status
                    </span>
                    <p className="font-bold text-amber-500 text-sm mt-1">
                      {versionStatus}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-light font-medium">
                      Trial Period
                    </span>
                    <p className="font-bold text-text text-sm mt-1">
                      {activeVersion?.trialDays || 0} Days
                    </p>
                  </div>
                  <div>
                    <span className="text-text-light font-medium">
                      Duration Cycle
                    </span>
                    <p className="font-bold text-text text-sm mt-1">
                      {activeVersion?.durationDays || 30} Days
                    </p>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-border">
                  <span className="text-text-light font-medium">
                    Description
                  </span>
                  <p className="mt-1 text-text leading-relaxed font-normal">
                    {activeVersion?.description ||
                      activeVersion?.subtitle ||
                      "No plan version description available."}
                  </p>
                </div>
              </div>

              {/* Version History Stack */}
              <div className="space-y-5 rounded-2xl border border-border bg-surface-secondary/40 p-5">
                <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Version Control Lifecycle
                </h3>

                <div className="space-y-3">
                  {plan.versions && plan.versions.length > 0 ? (
                    plan.versions.map((v: any) => (
                      <div
                        key={v.id || v.version}
                        className="flex items-center justify-between border border-border p-3.5 rounded-xl bg-surface hover:border-primary/40 transition"
                      >
                        <div>
                          <p className="font-bold text-xs text-text">
                            Version {v.version}
                          </p>
                          <p className="text-[11px] text-text-light mt-0.5">
                            Created on{" "}
                            {v.createdAt
                              ? new Date(v.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            v.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : v.status === "APPROVED"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-text-light/10 text-text-light"
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-light py-4 text-center">
                      No version history found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing */}
        {activeTab === "pricing" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-extrabold text-text">
                Regional & Currency Overrides
              </h3>
              <p className="text-xs text-text-light mt-1">
                Geographical pricing and category rates assigned to this plan
                version.
              </p>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs text-text">
                <thead className="bg-surface-secondary text-[11px] uppercase font-bold text-text-light border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Scope / Region</th>
                    <th className="px-6 py-3.5 font-bold">Currency</th>
                    <th className="px-6 py-3.5 font-bold">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="bg-surface font-medium">
                    <td className="px-6 py-4 font-bold text-primary">
                      Base Price (Default)
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {activeVersion?.currency || "USD"}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-sm text-text">
                      ${((activeVersion?.priceCents || 0) / 100).toFixed(2)}
                    </td>
                  </tr>
                  {countryPricingList.map((c: any, i: number) => (
                    <tr
                      key={c.id || i}
                      className="hover:bg-surface-secondary/40 transition"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {c.country || c.name} (Regional)
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {c.currency || "USD"}
                      </td>
                      <td className="px-6 py-4 font-bold text-text">
                        ${((c.priceCents || 0) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Features */}
        {activeTab === "features" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Included Features & Entitlements
            </h3>
            {featureList.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {featureList.map((feat: any, i: number) => (
                  <div
                    key={feat.key || i}
                    className="flex items-center justify-between border border-border p-4 rounded-xl bg-surface-secondary/30"
                  >
                    <div>
                      <p className="font-bold text-xs text-text capitalize">
                        {String(feat.key).replace("_", " ")}
                      </p>
                      <p className="text-[11px] text-text-light mt-0.5">
                        Feature entitlement
                      </p>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {feat.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                No custom features configured for this plan version.
              </p>
            )}
          </div>
        )}

        {/* Tab 4: Restrictions */}
        {activeTab === "restrictions" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Usage Gate Restrictions
            </h3>
            {featureList.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {featureList.map((r: any, i: number) => (
                  <div
                    key={r.key || i}
                    className="flex items-center justify-between border border-border p-4 rounded-xl bg-surface-secondary/30"
                  >
                    <div>
                      <p className="font-bold text-xs text-text capitalize">
                        {String(r.key).replace("_", " ")}
                      </p>
                      <p className="text-[11px] text-text-light mt-0.5">
                        Usage gate limit
                      </p>
                    </div>
                    <span className="rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500">
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                No system usage restrictions defined.
              </p>
            )}
          </div>
        )}

        {/* Tab 5: Countries */}
        {activeTab === "countries" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Country Scope Targeting
            </h3>
            {countryPricingList.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {countryPricingList.map((c: any, i: number) => (
                  <span
                    key={c.country || i}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-secondary px-3.5 py-2 text-xs font-bold text-text"
                  >
                    <Globe size={14} className="text-primary" />
                    {c.country || c.name || "Global"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                Global plan (No regional country restrictions).
              </p>
            )}
          </div>
        )}

        {/* Tab 6: Categories */}
        {activeTab === "categories" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Procurement Categories Scope
            </h3>
            {categoryPricingList.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {categoryPricingList.map((cat: any, i: number) => (
                  <span
                    key={cat.categoryId || i}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-secondary px-3.5 py-2 text-xs font-bold text-text"
                  >
                    <Briefcase size={14} className="text-primary" />
                    {cat.categoryId || "All Procurement Categories"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                All categories allowed (No category restrictions).
              </p>
            )}
          </div>
        )}

        {/* Tab 7: Coupons */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Promotional Coupons
            </h3>
            {couponsLoading ? (
              <div className="h-40 bg-border/40 animate-pulse rounded-xl" />
            ) : coupons.length > 0 ? (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs text-text">
                  <thead className="bg-surface-secondary text-[11px] font-bold uppercase text-text-light border-b border-border">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Coupon Code</th>
                      <th className="px-6 py-3.5 font-bold">Type</th>
                      <th className="px-6 py-3.5 font-bold">Discount Value</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {coupons.map((c: any) => (
                      <tr
                        key={c.id || c.code}
                        className="hover:bg-surface-secondary/40 transition"
                      >
                        <td className="px-6 py-4 font-mono font-extrabold text-primary text-xs">
                          {c.code}
                        </td>
                        <td className="px-6 py-4 font-bold uppercase text-[10px]">
                          {c.type}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {c.type === "percentage"
                            ? `${c.value}% OFF`
                            : `$${c.value}`}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              c.status === "ACTIVE" ? "Active" : "Inactive"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                No active promotional coupons found.
              </p>
            )}
          </div>
        )}

        {/* Tab 8: Subscribers */}
        {activeTab === "subscribers" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Active Plan Subscribers ({planSubscribers.length})
            </h3>

            {!isPublished ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6">
                <Lock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-text">
                  Plan Version Not Published
                </h4>
                <p className="text-xs text-text-light mt-1 max-w-md mx-auto leading-relaxed">
                  Active vendor subscribers can only enroll once this plan
                  version is approved and published.
                </p>
              </div>
            ) : subscribersLoading ? (
              <div className="h-40 bg-border/40 animate-pulse rounded-xl" />
            ) : planSubscribers.length > 0 ? (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs text-text">
                  <thead className="bg-surface-secondary text-[11px] font-bold uppercase text-text-light border-b border-border">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">
                        Subscriber ID / User
                      </th>
                      <th className="px-6 py-3.5 font-bold">Start Date</th>
                      <th className="px-6 py-3.5 font-bold">End Date</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {planSubscribers.map((s: any) => (
                      <tr
                        key={s.id}
                        className="hover:bg-surface-secondary/40 transition"
                      >
                        <td className="px-6 py-4 font-bold font-mono">
                          {s.userId}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {s.startDate
                            ? new Date(s.startDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {s.endDate
                            ? new Date(s.endDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              s.status === "active" ? "Active" : "Inactive"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-light py-8 text-center border border-dashed border-border rounded-xl">
                No active subscribers enrolled in this plan tier.
              </p>
            )}
          </div>
        )}

        {/* Tab 9: Audit History */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-text">
              Audit History Trail
            </h3>
            <div className="relative border-l border-border pl-6 ml-3 space-y-6">
              {plan.versions && plan.versions.length > 0 ? (
                plan.versions.map((v: any, i: number) => (
                  <div key={v.id || i} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary border-2 border-surface" />
                    <p className="text-xs font-bold text-text">
                      Plan Version v{v.version} ({v.status})
                    </p>
                    <p className="text-[11px] text-text-light mt-0.5">
                      Created on{" "}
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-light py-4">
                  No audit logs recorded.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 10: Maker-Checker Review Board & Discussion Thread */}
        {activeTab === "review" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 1. Governance Review Header Card */}
            <div className="p-5 rounded-2xl bg-surface-secondary/40 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-text">
                    Maker-Checker Governance Review
                  </h3>
                  <p className="text-xs text-text-light mt-0.5">
                    Submit draft version to an assigned reviewer for approval.
                  </p>
                </div>
                <Badge
                  color={
                    isApproved ? "green" : isUnderReview ? "indigo" : "yellow"
                  }
                >
                  {versionStatus}
                </Badge>
              </div>

              <div className="border-t border-border pt-4 grid gap-4 md:grid-cols-2 items-end">
                {/* Reviewer Selector */}
                <div>
                  <label className="text-xs font-bold text-text-light uppercase tracking-wider block mb-1.5">
                    Assigned Reviewer (Checker)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedReviewerId}
                      onChange={(e) => setSelectedReviewerId(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">
                        {usersLoading
                          ? "Loading admin reviewers..."
                          : "Select Checker Admin..."}
                      </option>
                      {assignableUsers.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.name || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAssignReviewer}
                      disabled={
                        !selectedReviewerId || assignReviewerMutation.isPending
                      }
                      className="text-xs font-bold whitespace-nowrap"
                    >
                      Assign
                    </Button>
                  </div>
                </div>

                {/* Governance Status Action Panel */}
                <div className="flex justify-end">
                  {isApproved ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-4 w-full">
                      <div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          ● Status: Governance Approved & Released
                        </div>
                        <div className="text-text-light mt-0.5 text-[11px]">
                          This plan version has passed Maker-Checker review and
                          is ready for production.
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={Plus}
                        onClick={handleCreateVersionDraft}
                        className="text-xs font-bold whitespace-nowrap shrink-0"
                      >
                        Create New Draft
                      </Button>
                    </div>
                  ) : !isUnderReview ? (
                    <Button
                      onClick={handleSubmitForReview}
                      disabled={submitReviewMutation.isPending}
                      className="text-xs font-bold"
                    >
                      Submit Draft for Governance Review
                    </Button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between gap-4 w-full">
                      <div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          ● Status: Pending Reviewer Decision
                        </div>
                        <div className="text-text-light mt-0.5 text-[11px]">
                          Assigned reviewers must approve or reject this plan
                          version.
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleReviewAction("APPROVE")}
                          disabled={reviewActionMutation.isPending}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewAction("REJECT")}
                          disabled={reviewActionMutation.isPending}
                          className="text-xs font-bold"
                        >
                          Request Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Governance Discussion Thread */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Governance Discussion Thread
                  </h3>
                  <p className="text-xs text-text-light mt-0.5">
                    Post review notes, questions, or change rationales.
                  </p>
                </div>
                <Badge color="indigo">
                  {activeReview?.comments?.length || 0} Notes
                </Badge>
              </div>

              {/* Comment Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reviewComment.trim()) {
                    handleReviewAction("APPROVE");
                  }
                }}
                className="space-y-3 bg-surface-secondary/40 p-4 rounded-2xl border border-border"
              >
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Type a review note or rationale..."
                  className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    leftIcon={Send}
                    disabled={
                      !reviewComment.trim() || reviewActionMutation.isPending
                    }
                    className="text-xs font-bold"
                  >
                    Post Note
                  </Button>
                </div>
              </form>

              {/* Discussion Thread Feed */}
              <div className="space-y-3">
                {!activeReview?.comments ||
                activeReview.comments.length === 0 ? (
                  <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-text-light italic">
                    No discussion notes posted yet.
                  </div>
                ) : (
                  activeReview.comments.map((c: any, i: number) => (
                    <div
                      key={c.id || i}
                      className="p-4 bg-surface-secondary/30 border border-border rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex justify-between font-bold text-text">
                        <span>
                          {c.author?.email ||
                            c.author?.name ||
                            "Governance Reviewer"}
                        </span>
                        <span className="text-[10px] text-text-light font-normal">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-text leading-relaxed font-normal">
                        {c.text || c.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Migration Batch Drawer */}
      {migrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-extrabold text-text">
                Batch Subscription Migration
              </h3>
              <button
                onClick={() => setMigrationOpen(false)}
                className="text-text-light hover:text-text font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <p className="text-xs text-text-light leading-relaxed">
                Migrate subscribers in batch from the current active version to
                another approved target version.
              </p>

              <div>
                <label className="text-xs font-bold text-text-light uppercase tracking-wider">
                  Source Version
                </label>
                <div className="mt-1.5 rounded-xl border border-border bg-surface-secondary p-3.5 font-bold text-xs text-text">
                  v{activeVersion?.version || 1} ({versionStatus})
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-light uppercase tracking-wider">
                  Target Approved Version
                </label>
                <select
                  value={selectedTargetVersion}
                  onChange={(e) => setSelectedTargetVersion(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface-secondary p-3.5 text-xs font-bold text-text outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select Target Version</option>
                  {plan.versions?.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 leading-relaxed flex gap-2.5">
                <AlertTriangle size={18} className="shrink-0 text-amber-500" />
                <span>
                  <strong>Caution:</strong> This action will migrate{" "}
                  {planSubscribers.length} active subscriber(s) to the target
                  version.
                </span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <Button
                className="flex-1 text-xs py-2.5 font-bold"
                leftIcon={Play}
                onClick={handleBatchMigration}
                disabled={migrateMutation.isPending}
              >
                {migrateMutation.isPending ? "Migrating..." : "Start Migration"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs py-2.5 font-bold"
                onClick={() => setMigrationOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
