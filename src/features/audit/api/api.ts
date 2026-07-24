import { apiClient } from "@/lib/http";

import type { ApiResponse } from "@/types";
import type {
  AuditExportJob,
  AuditLog,
  AuditQuery,
  AuditStatistics,
  RequestAuditExportInput,
  RetentionPolicy,
  SecurityEventsQuery,
  SecurityLog,
  UpdateRetentionInput,
} from "../types";

export const auditApi = {
  searchLogs(query?: AuditQuery) {
    return apiClient.get<ApiResponse<{ logs: AuditLog[]; total: number; page: number; limit: number }>>("/audit-logs", {
      params: query,
    });
  },

  getStatistics() {
    return apiClient.get<ApiResponse<AuditStatistics>>("/audit-logs/statistics");
  },

  getSecurityEvents(query?: SecurityEventsQuery) {
    return apiClient.get<ApiResponse<{ logs: SecurityLog[]; total: number; page: number; limit: number }>>("/audit-logs/security", {
      params: query,
    });
  },

  getRetentionPolicies() {
    return apiClient.get<ApiResponse<RetentionPolicy[]>>("/audit-logs/retention");
  },

  updateRetentionPolicy(input: UpdateRetentionInput) {
    return apiClient.patch<ApiResponse<RetentionPolicy>>("/audit-logs/retention", input);
  },

  requestAuditExport(input: RequestAuditExportInput) {
    return apiClient.post<ApiResponse<AuditExportJob>>("/audit-logs/export", input);
  },

  getCorrelationTimeline(correlationId: string) {
    return apiClient.get<ApiResponse<AuditLog[]>>(`/audit-logs/correlation/${correlationId}`);
  },

  getRequestTimeline(requestId: string) {
    return apiClient.get<ApiResponse<AuditLog[]>>(`/audit-logs/request/${requestId}`);
  },

  getLogDetails(id: string) {
    return apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
  },
};
