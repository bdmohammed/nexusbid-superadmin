import { apiClient } from "@/lib/http";

import type { ApiResponse } from "@/types";
import type {
  CriticalAlerts,
  DashboardConfig,
  PatchLayoutInput,
  QuickActionItem,
  RecentActivityItem,
  RevenueStats,
  ReviewQueueStats,
  SystemHealth,
  TenderStats,
  UsersStats,
} from "../types";

export const dashboardApi = {
  getConfig() {
    return apiClient.get<ApiResponse<DashboardConfig>>("/dashboard/config");
  },

  getTenderStats() {
    return apiClient.get<ApiResponse<TenderStats>>("/dashboard/tenders");
  },

  getRevenueStats() {
    return apiClient.get<ApiResponse<RevenueStats>>("/dashboard/revenue");
  },

  getUsersStats() {
    return apiClient.get<ApiResponse<UsersStats>>("/dashboard/users");
  },

  getReviewQueue() {
    return apiClient.get<ApiResponse<ReviewQueueStats>>("/dashboard/review-queue");
  },

  getCriticalAlerts() {
    return apiClient.get<ApiResponse<CriticalAlerts>>("/dashboard/alerts");
  },

  getRecentActivity() {
    return apiClient.get<ApiResponse<RecentActivityItem[]>>("/dashboard/recent-activity");
  },

  getSystemHealth() {
    return apiClient.get<ApiResponse<SystemHealth>>("/dashboard/system-health");
  },

  getQuickActionsList() {
    return apiClient.get<ApiResponse<QuickActionItem[]>>("/dashboard/quick-actions");
  },

  updateLayout(input: PatchLayoutInput) {
    return apiClient.patch<ApiResponse<any>>("/dashboard/layout", input);
  },

  resetLayout() {
    return apiClient.post<ApiResponse<any>>("/dashboard/layout/reset");
  },
};
