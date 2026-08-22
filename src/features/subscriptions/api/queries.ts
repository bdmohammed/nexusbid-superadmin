import { useQuery } from "@tanstack/react-query";

import { subscriptionApi } from "./api";
import { subscriptionQueryKeys } from "./keys";

import type { ErrorCode } from "@/lib/errors";
import { AppError } from "@/lib/errors";

export function usePlans() {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans(),

    queryFn: async () => {
      const { data } = await subscriptionApi.getPlans();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionQueryKeys.me(),

    queryFn: async () => {
      const { data } = await subscriptionApi.getMySubscription();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: subscriptionQueryKeys.adminPlans(),

    queryFn: async () => {
      const { data } = await subscriptionApi.getAdminPlans();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useAdminSubscriptions(page: number, limit: number) {
  return useQuery({
    queryKey: subscriptionQueryKeys.adminSubscriptions(page, limit),

    queryFn: async () => {
      const { data } = await subscriptionApi.getAdminSubscriptions(page, limit);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: subscriptionQueryKeys.adminUserStats(),

    queryFn: async () => {
      const { data } = await subscriptionApi.getAdminUserStats();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useAdminRevenueStats() {
  return useQuery({
    queryKey: subscriptionQueryKeys.adminRevenueStats(),

    queryFn: async () => {
      const { data } = await subscriptionApi.getAdminRevenueStats();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useSubscriptionsDashboardStats() {
  return useQuery({
    queryKey: subscriptionQueryKeys.dashboardStats(),
    queryFn: async () => {
      const { data } = await subscriptionApi.getSubscriptionsDashboardStats();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useFeatureCatalog() {
  return useQuery({
    queryKey: subscriptionQueryKeys.features(),
    queryFn: async () => {
      const { data } = await subscriptionApi.getFeatureCatalog();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data ?? [];
    },
  });
}

export function useCouponsList() {
  return useQuery({
    queryKey: subscriptionQueryKeys.coupons(),
    queryFn: async () => {
      const { data } = await subscriptionApi.listCoupons();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data ?? [];
    },
  });
}

export function usePlanDetails(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.planDetails(id),
    queryFn: async () => {
      const { data } = await subscriptionApi.getPlanById(id);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    enabled: !!id,
  });
}

export function useAllPlansAdmin() {
  return useQuery({
    queryKey: [...subscriptionQueryKeys.all, "admin-all-plans"],
    queryFn: async () => {
      const { data } = await subscriptionApi.listAllPlans();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data ?? [];
    },
  });
}
