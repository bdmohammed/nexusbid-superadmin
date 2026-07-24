import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppError, ERROR_CODES, ErrorCode } from "@/lib/errors";
import { dashboardApi } from "./api";
import { dashboardQueryKeys } from "./keys";

import type { PatchLayoutInput } from "../types";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useDashboardConfig() {
  return useQuery({
    queryKey: dashboardQueryKeys.config(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getConfig();
      console.log(data);
      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch dashboard config",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardTenders() {
  return useQuery({
    queryKey: dashboardQueryKeys.tenderStats(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getTenderStats();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch tender stats",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardRevenue() {
  return useQuery({
    queryKey: dashboardQueryKeys.revenueStats(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getRevenueStats();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch revenue stats",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardUsers() {
  return useQuery({
    queryKey: dashboardQueryKeys.usersStats(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getUsersStats();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user stats",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardReviewQueue() {
  return useQuery({
    queryKey: dashboardQueryKeys.reviewQueue(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getReviewQueue();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch review queue stats",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardQueryKeys.criticalAlerts(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getCriticalAlerts();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch dashboard alerts",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardRecentActivity() {
  return useQuery({
    queryKey: dashboardQueryKeys.recentActivity(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getRecentActivity();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch recent activities",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useDashboardSystemHealth() {
  return useQuery({
    queryKey: dashboardQueryKeys.systemHealth(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getSystemHealth();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch system health telemetry",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useDashboardQuickActions() {
  return useQuery({
    queryKey: dashboardQueryKeys.quickActions(),
    queryFn: async () => {
      const { data, status } = await dashboardApi.getQuickActionsList();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch quick actions list",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useUpdateDashboardLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PatchLayoutInput) => {
      const { data } = await dashboardApi.updateLayout(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.config() });
    },
  });
}

export function useResetDashboardLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await dashboardApi.resetLayout();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.config() });
    },
  });
}
