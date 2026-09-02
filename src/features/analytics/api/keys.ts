import type { AnalyticsQuery } from '../types';

export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  overview: (query?: AnalyticsQuery) => [...analyticsQueryKeys.all, 'overview', query] as const,
  tenders: (query?: AnalyticsQuery) => [...analyticsQueryKeys.all, 'tenders', query] as const,
  users: (query?: AnalyticsQuery) => [...analyticsQueryKeys.all, 'users', query] as const,
  revenue: (query?: AnalyticsQuery) => [...analyticsQueryKeys.all, 'revenue', query] as const,
  categories: () => [...analyticsQueryKeys.all, 'categories'] as const,
  system: () => [...analyticsQueryKeys.all, 'system'] as const,
  dashboard: () => [...analyticsQueryKeys.all, 'dashboard'] as const,
  alerts: () => [...analyticsQueryKeys.all, 'alerts'] as const,
  exportJobs: () => [...analyticsQueryKeys.all, 'export-jobs'] as const,
  reportSchedules: () => [...analyticsQueryKeys.all, 'report-schedules'] as const,
  userGrowth: (query?: AnalyticsQuery) =>
    [...analyticsQueryKeys.all, 'user-growth', query] as const,
  revenueLegacy: (query?: AnalyticsQuery) =>
    [...analyticsQueryKeys.all, 'revenue-legacy', query] as const,
  topDownloads: () => [...analyticsQueryKeys.all, 'top-downloads'] as const,
};
