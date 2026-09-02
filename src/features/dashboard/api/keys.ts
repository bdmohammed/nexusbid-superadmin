export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  config: () => [...dashboardQueryKeys.all, 'config'] as const,
  tenderStats: () => [...dashboardQueryKeys.all, 'tenders'] as const,
  revenueStats: () => [...dashboardQueryKeys.all, 'revenue'] as const,
  usersStats: () => [...dashboardQueryKeys.all, 'users'] as const,
  reviewQueue: () => [...dashboardQueryKeys.all, 'review-queue'] as const,
  criticalAlerts: () => [...dashboardQueryKeys.all, 'alerts'] as const,
  recentActivity: () => [...dashboardQueryKeys.all, 'recent-activity'] as const,
  systemHealth: () => [...dashboardQueryKeys.all, 'system-health'] as const,
  quickActions: () => [...dashboardQueryKeys.all, 'quick-actions'] as const,
};
