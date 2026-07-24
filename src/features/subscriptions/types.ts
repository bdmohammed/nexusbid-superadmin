export interface Plan {
    id: string;
    name: string;
    priceCents: number;
    durationDays: number;
    isRecurring: boolean;
    isActive: boolean;
    features: Record<string, any>;
    paypalPlanId: string | null;
    planType: 'all-access' | 'state' | 'country' | 'category' | 'bundle';
    targetStateId: string | null;
    targetCountry: string | null;
    targetCategoryId: string | null;
    bundleSize: number | null;
    trialDays: number;
    discountPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'pending' | 'active' | 'cancelled' | 'expired' | 'past_due';
    startDate: string;
    endDate: string;
    paypalSubscriptionId: string | null;
    paypalOrderId: string | null;
    targetStateId: string | null;
    targetCountry: string | null;
    targetCategoryId: string | null;
    selectedCategoryIds: string[] | null;
    plan?: Plan;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionDto {
    planId: string;
    returnUrl: string;
    cancelUrl: string;
    targetStateId?: string;
    targetCountry?: string;
    targetCategoryId?: string;
    selectedCategoryIds?: string[];
}

export interface CreateSubscriptionResponse {
    approvalUrl: string;
    subscriptionId: string;
}

export interface MySubscriptionResponse {
    subscription: Subscription | null;
    plan: Plan | null;
}

export interface PlanFeatureCatalogItem {
    id: string;
    key: string;
    name: string;
    description?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface SubscriptionMigrationInput {
    sourcePlanId: string;
    targetPlanId: string;
}

export interface CreatePlanInput {
    name: string;
    subtitle?: string | null;
    description?: string | null;
    priceCents: number;
    currency?: string;
    durationDays?: number;
    trialDays?: number;
    setupFeeCents?: number;
    isRecurring?: boolean;
    isFeatured?: boolean;
    badge?: string | null;
    planType: 'all-access' | 'state' | 'country' | 'category' | 'bundle';
    targetStateId?: string | null;
    targetCountry?: string | null;
    targetCategoryId?: string | null;
    bundleSize?: number | null;
    features?: Array<{ featureKey: string; limitValue: string }>;
    countryPricing?: Array<{ country: string; currency: string; priceCents: number }>;
    categoryPricing?: Array<{ categoryId: string; priceCents: number }>;
}

export interface CreatePlanVersionDraftInput {
    price: number;
}

export interface AssignReviewerInput {
    reviewerId: string;
}

export interface SubmitReviewActionInput {
    action: 'APPROVE' | 'REJECT';
    comment?: string;
}

export interface UpdatePlanLegacyInput {
    name?: string;
    priceCents?: number;
    durationDays?: number;
    isRecurring?: boolean;
    isActive?: boolean;
    features?: Record<string, any>;
    paypalPlanId?: string | null;
    discountPercentage?: number;
}

export interface SubscriptionDashboardStats {
    totalRevenue: number;
    activeSubscriptions: number;
    churnRate: number;
    revenueGrowth: number;
}