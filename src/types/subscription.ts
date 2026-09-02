export type PlanStatus = 'ACTIVE' | 'ARCHIVED';
export type PlanVersionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED';
export type MigrationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface PlanFeature {
  id: string;
  featureKey: string;
  limitValue: string;
}

export interface PlanCountryPricing {
  id: string;
  country: string;
  currency: string;
  priceCents: number;
}

export interface PlanCategoryPricing {
  id: string;
  categoryId: string;
  priceCents: number;
}

export interface PlanReviewComment {
  id: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  commentText: string;
  createdAt: string;
}

export interface PlanReview {
  id: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED';
  assignedReviewer?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  comments: PlanReviewComment[];
}

export interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  status: PlanVersionStatus;
  name: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  currency: string;
  durationDays: number;
  trialDays: number;
  setupFeeCents: number;
  isRecurring: boolean;
  isFeatured: boolean;
  badge: string | null;
  planType: 'all-access' | 'state' | 'country' | 'category' | 'bundle';
  targetStateId: string | null;
  targetCountry: string | null;
  targetCategoryId: string | null;
  bundleSize: number | null;
  createdById: string | null;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
  features: PlanFeature[];
  countryPricing: PlanCountryPricing[];
  categoryPricing: PlanCategoryPricing[];
  reviews: PlanReview[];
}

export interface SubscriptionPlan {
  id: string;
  referenceNo: string;
  activeVersionId: string | null;
  status: PlanStatus;
  createdAt: string;
  versions: PlanVersion[];
  activeVersion: PlanVersion | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_month' | 'trial_extension';
  discountValue: number;
  isActive: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface SubscriptionMigration {
  id: string;
  sourcePlanVersionId: string;
  sourceVersion: PlanVersion;
  targetPlanVersionId: string;
  targetVersion: PlanVersion;
  status: MigrationStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdById: string;
  createdAt: string;
}

export interface BackendSubscription {
  id: string;
  userId: string;
  planId: string;
  planVersionId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'pending';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
  };
  plan: SubscriptionPlan;
  planVersion: PlanVersion;
}

export interface AdminUserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  admins: number;
  customers: number;
  pendingVerification: number;
  pendingApprovalAdmins: number;
  subscribed: number;
  blocked: number;
  onlineNow: number;
  newToday: number;
  newThisMonth: number;
}
