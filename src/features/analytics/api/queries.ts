import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppError, ErrorCode } from "@/lib/errors";
import { analyticsApi } from "./api";
import { analyticsQueryKeys } from "./keys";

import type {
  AnalyticsQuery,
  CreateScheduledReportInput,
  RequestExportInput,
  SaveDashboardLayoutInput,
} from "../types";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useAnalyticsOverview(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.overview(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getOverview(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch overview stats",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

export function useAnalyticsTenders(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.tenders(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getTenders(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch tender analytics",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsUsers(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.users(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getUsersMetrics(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user metrics",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsRevenue(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.revenue(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getRevenueMetrics(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch revenue metrics",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsCategories() {
  return useQuery({
    queryKey: analyticsQueryKeys.categories(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getCategoriesMetrics();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch category metrics",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsSystem() {
  return useQuery({
    queryKey: analyticsQueryKeys.system(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getSystemMetrics();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch system metrics",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: analyticsQueryKeys.dashboard(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getDashboard();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch dashboard layout",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

export function useAnalyticsAlerts() {
  return useQuery({
    queryKey: analyticsQueryKeys.alerts(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getAlertsList();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch active alerts list",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsExportJobs() {
  return useQuery({
    queryKey: analyticsQueryKeys.exportJobs(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getExportJobs();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch export jobs list",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsReportSchedules() {
  return useQuery({
    queryKey: analyticsQueryKeys.reportSchedules(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.listReportSchedules();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to list report schedules",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsUserGrowth(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.userGrowth(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getUserGrowth(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user growth data",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsRevenueLegacy(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsQueryKeys.revenueLegacy(query),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getRevenueLegacy(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch legacy revenue data",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useAnalyticsTopDownloads() {
  return useQuery({
    queryKey: analyticsQueryKeys.topDownloads(),
    queryFn: async () => {
      const { data, status } = await analyticsApi.getTopDownloads();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch top downloads",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useSaveAnalyticsDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveDashboardLayoutInput) => {
      const { data } = await analyticsApi.saveDashboard(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.dashboard() });
    },
  });
}

export function useResolveAlertTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await analyticsApi.resolveAlertTrigger(alertId);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.alerts() });
    },
  });
}

export function useRequestDataExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RequestExportInput) => {
      const { data } = await analyticsApi.requestDataExport(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.exportJobs() });
    },
  });
}

export function useCreateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateScheduledReportInput) => {
      const { data } = await analyticsApi.createReportSchedule(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reportSchedules() });
    },
  });
}
