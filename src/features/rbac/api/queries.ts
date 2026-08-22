import { useQuery } from "@tanstack/react-query";

import { rbacApi } from "./api";
import { rbacKeys } from "./keys";

import type { ErrorCode } from "@/lib/errors";
import { AppError } from "@/lib/errors";

/**
 * Get all roles.
 */
export function useRoles() {
  return useQuery({
    queryKey: rbacKeys.roles(),
    queryFn: async () => {
      const { data } = await rbacApi.getRoles();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get role by ID.
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: rbacKeys.role(id),
    queryFn: async () => {
      const { data } = await rbacApi.getRoleById(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Get all user role assignments.
 */
export function useAssignments() {
  return useQuery({
    queryKey: rbacKeys.assignments(),
    queryFn: async () => {
      const { data } = await rbacApi.getAssignments();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Get all permissions.
 */
export function usePermissions() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: async () => {
      const { data } = await rbacApi.getPermissions();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    staleTime: Infinity,
  });
}

/**
 * Get permission modules.
 */
export function useModules() {
  return useQuery({
    queryKey: rbacKeys.modules(),
    queryFn: async () => {
      const { data } = await rbacApi.getModules();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    staleTime: Infinity,
  });
}

/**
 * Get RBAC audit logs.
 */
export function useAuditLogs() {
  return useQuery({
    queryKey: rbacKeys.auditLogs(),
    queryFn: async () => {
      const { data } = await rbacApi.getAuditLogs();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Get users eligible for role assignment.
 */
export function useAssignableUsers() {
  return useQuery({
    queryKey: rbacKeys.assignableUsers(),
    queryFn: async () => {
      const { data } = await rbacApi.getAssignableUsers();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Get categorized roles list.
 */
export function useCategorizedRoles() {
  return useQuery({
    queryKey: rbacKeys.categorizedRoles(),
    queryFn: async () => {
      const { data } = await rbacApi.getCategorizedRoles();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Get RBAC module statistics.
 */
export function useRbacStats() {
  return useQuery({
    queryKey: rbacKeys.stats(),
    queryFn: async () => {
      const { data } = await rbacApi.getStats();
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Get historical role versions.
 */
export function useRoleVersions(roleId: string) {
  return useQuery({
    queryKey: rbacKeys.roleVersions(roleId),
    queryFn: async () => {
      const { data } = await rbacApi.getRoleVersions(roleId);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    enabled: !!roleId,
  });
}

/**
 * Get details of a role review.
 */
export function useReviewDetails(reviewId: string) {
  return useQuery({
    queryKey: rbacKeys.reviewDetails(reviewId),
    queryFn: async () => {
      const { data } = await rbacApi.getReviewDetails(reviewId);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    enabled: !!reviewId,
  });
}

/**
 * Get forensic activity logs.
 */
export function useForensicLogs(params?: any) {
  return useQuery({
    queryKey: rbacKeys.forensicLogs(params),
    queryFn: async () => {
      const { data } = await rbacApi.getForensicLogs(params);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}
