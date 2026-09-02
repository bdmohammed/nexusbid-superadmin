export const subscriptionQueryKeys = {
  all: ['subscriptions'] as const,

  plans: () => [...subscriptionQueryKeys.all, 'plans'] as const,

  me: () => [...subscriptionQueryKeys.all, 'me'] as const,

  adminPlans: () => [...subscriptionQueryKeys.all, 'admin', 'plans'] as const,

  adminSubscriptions: (page: number, limit: number) =>
    [...subscriptionQueryKeys.all, 'admin', 'list', { page, limit }] as const,

  adminUserStats: () => [...subscriptionQueryKeys.all, 'admin', 'user-stats'] as const,

  adminRevenueStats: () => [...subscriptionQueryKeys.all, 'admin', 'revenue-stats'] as const,

  dashboardStats: () => [...subscriptionQueryKeys.all, 'admin', 'dashboard-stats'] as const,

  features: () => [...subscriptionQueryKeys.all, 'admin', 'features-catalog'] as const,

  coupons: () => [...subscriptionQueryKeys.all, 'admin', 'coupons-list'] as const,

  planDetails: (id: string) => [...subscriptionQueryKeys.all, 'admin', 'plan-details', id] as const,
};
