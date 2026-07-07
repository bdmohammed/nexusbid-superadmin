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