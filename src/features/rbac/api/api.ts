import type {
  AuditLog,
  CreateAssignmentDto,
  CreateRoleDto,
  PermissionModule,
  Role,
  UpdateRoleDto,
  UserRoleAssignment,
} from "../types";
import type { ApiResponse } from "@/types";
import { apiClient } from "@/lib/http";

export const rbacApi = {
  getRoles() {
    return apiClient.get<ApiResponse<Role[]>>("/rbac/roles");
  },

  getCategorizedRoles() {
    return apiClient.get<ApiResponse<Role[]>>("/rbac/roles/categorized");
  },

  getRoleById(id: string) {
    return apiClient.get<ApiResponse<Role>>(`/rbac/roles/${id}`);
  },

  createRole(data: CreateRoleDto) {
    return apiClient.post<ApiResponse<Role>>("/rbac/roles", {
      name: data.name,
      description: data.description || null,
      permissionKeys: data.permissions,
    });
  },

  updateRole(id: string, data: UpdateRoleDto) {
    return apiClient.put<ApiResponse<Role>>(`/rbac/roles/${id}`, {
      name: data.name,
      description: data.description || null,
      permissionKeys: data.permissions,
      isActive: true,
    });
  },

  deleteRole(id: string) {
    return apiClient.delete<ApiResponse<any>>(`/rbac/roles/${id}`);
  },

  getAssignments() {
    return apiClient.get<ApiResponse<UserRoleAssignment[]>>(
      "/rbac/assignments",
    );
  },

  createAssignment(data: CreateAssignmentDto) {
    return apiClient.post<ApiResponse<any>>("/rbac/assignments", data);
  },

  deleteAssignment(id: string) {
    return apiClient.delete<ApiResponse<any>>(`/rbac/assignments/${id}`);
  },

  updateAssignmentStatus(id: string, status: string, comment?: string) {
    return apiClient.patch<ApiResponse<any>>(`/rbac/assignments/${id}/status`, {
      status,
      comment,
    });
  },

  getAuditLogs() {
    return apiClient.get<ApiResponse<AuditLog[]>>("/rbac/audit-logs");
  },

  getForensicLogs(params?: any) {
    return apiClient.get<ApiResponse<{ logs: any[]; total: number }>>(
      "/audit-logs",
      { params },
    );
  },

  getAuditStats() {
    return apiClient.get<ApiResponse<any>>("/audit-logs/statistics");
  },

  getSecurityEvents(params?: any) {
    return apiClient.get<ApiResponse<{ logs: any[]; total: number }>>(
      "/audit-logs/security",
      { params },
    );
  },

  getRetentionPolicies() {
    return apiClient.get<ApiResponse<any[]>>("/audit-logs/retention");
  },

  updateRetentionPolicy(data: any) {
    return apiClient.patch<ApiResponse<any>>("/audit-logs/retention", data);
  },

  exportAuditLogs(data: any) {
    return apiClient.post<ApiResponse<any>>("/audit-logs/export", data);
  },

  getCorrelationTimeline(correlationId: string) {
    return apiClient.get<ApiResponse<any[]>>(
      `/audit-logs/correlation/${correlationId}`,
    );
  },

  getRequestTimeline(requestId: string) {
    return apiClient.get<ApiResponse<any[]>>(
      `/audit-logs/request/${requestId}`,
    );
  },

  getPermissions() {
    return apiClient.get<ApiResponse<any[]>>("/rbac/permissions");
  },

  getModules() {
    return apiClient.get<ApiResponse<PermissionModule[]>>("/rbac/modules");
  },

  getAssignableUsers(params?: Record<string, any>) {
    return apiClient.get<ApiResponse<any[]>>("/admin/users", {
      params,
    });
  },

  getRoleVersions(roleId: string) {
    return apiClient.get<ApiResponse<any[]>>(`/rbac/roles/${roleId}/versions`);
  },

  lockVersion(versionId: string) {
    return apiClient.post<ApiResponse<any>>(`/rbac/versions/${versionId}/lock`);
  },

  unlockVersion(versionId: string) {
    return apiClient.post<ApiResponse<any>>(
      `/rbac/versions/${versionId}/unlock`,
    );
  },

  compareVersions(roleId: string, v1: number, v2: number) {
    return apiClient.get<ApiResponse<any>>(
      `/rbac/roles/${roleId}/versions/${v1}/compare/${v2}`,
    );
  },

  submitVersion(versionId: string, reviewerIds: string[]) {
    return apiClient.post<ApiResponse<any>>(
      `/rbac/versions/${versionId}/submit`,
      { reviewerIds },
    );
  },

  submitReview(
    reviewId: string,
    status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    comment = "",
  ) {
    return apiClient.post<ApiResponse<any>>(
      `/rbac/reviews/${reviewId}/action`,
      { status, comment },
    );
  },

  getReviewDetails(reviewId: string) {
    return apiClient.get<ApiResponse<any>>(`/rbac/reviews/${reviewId}`);
  },

  getStats() {
    return apiClient.get<ApiResponse<any>>("/rbac/statistics");
  },

  exportData() {
    return apiClient.get<ApiResponse<any>>("/rbac/exports");
  },
};
