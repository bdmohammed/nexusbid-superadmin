import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { auditApi } from "./api";
import { auditQueryKeys } from "./keys";

import type {
  AuditQuery,
  RequestAuditExportInput,
  SecurityEventsQuery,
  UpdateRetentionInput,
} from "../types";
import type { ErrorCode } from "@/lib/errors";
import { AppError } from "@/lib/errors";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useAuditLogs(query?: AuditQuery) {
  return useQuery({
    queryKey: auditQueryKeys.logs(query),
    queryFn: async () => {
      const { data, status } = await auditApi.searchLogs(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch audit logs",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useAuditStatistics() {
  return useQuery({
    queryKey: auditQueryKeys.statistics(),
    queryFn: async () => {
      const { data, status } = await auditApi.getStatistics();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch audit statistics",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useSecurityEvents(query?: SecurityEventsQuery) {
  return useQuery({
    queryKey: auditQueryKeys.security(query),
    queryFn: async () => {
      const { data, status } = await auditApi.getSecurityEvents(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch security events",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useRetentionPolicies() {
  return useQuery({
    queryKey: auditQueryKeys.retention(),
    queryFn: async () => {
      const { data, status } = await auditApi.getRetentionPolicies();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch retention policies",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useCorrelationTimeline(correlationId: string) {
  return useQuery({
    queryKey: auditQueryKeys.correlation(correlationId),
    queryFn: async () => {
      const { data, status } =
        await auditApi.getCorrelationTimeline(correlationId);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch correlation timeline",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
    enabled: !!correlationId,
  });
}

export function useRequestTimeline(requestId: string) {
  return useQuery({
    queryKey: auditQueryKeys.request(requestId),
    queryFn: async () => {
      const { data, status } = await auditApi.getRequestTimeline(requestId);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch request timeline",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
    enabled: !!requestId,
  });
}

export function useAuditLogDetails(id: string) {
  return useQuery({
    queryKey: auditQueryKeys.details(id),
    queryFn: async () => {
      const { data, status } = await auditApi.getLogDetails(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch log details",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRetentionInput) => {
      const { data } = await auditApi.updateRetentionPolicy(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.retention() });
    },
  });
}

export function useRequestAuditExport() {
  return useMutation({
    mutationFn: async (input: RequestAuditExportInput) => {
      const { data } = await auditApi.requestAuditExport(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}
