import { useQuery } from "@tanstack/react-query";

import { authApi } from "./api";
import { authQueryKeys } from "./keys";
import { AppError, ErrorCode } from "@/lib/errors";
import type { ListUsersQuery } from "../types";

/**
 * Get currently authenticated user.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.me(),

    queryFn: async () => {
      const isGuestPage =
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/register"));

      try {
        const { data } = await authApi.me();

        if (!data.success) {
          throw new AppError(data.message, 400, data.error as ErrorCode);
        }

        return data.data;
      } catch (err) {
        if (isGuestPage) {
          return null;
        }
        throw err;
      }
    },

    retry: (failureCount) => {
      const isGuestPage =
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/register"));
      if (isGuestPage) return false;
      return failureCount < 1;
    },
  });
}

/**
 * Check whether user has a valid session.
 */
export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session(),

    queryFn: async () => {
      const { data } = await authApi.me();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },

    staleTime: Infinity,
    retry: false,
  });
}

/**
 * Get all active authentication sessions.
 */
export function useUserSessions() {
  return useQuery({
    queryKey: authQueryKeys.sessions(),
    queryFn: async () => {
      const { data, status } = await authApi.getSessions();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch active sessions",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

/**
 * Get all user login devices.
 */
export function useUserDevices() {
  return useQuery({
    queryKey: authQueryKeys.devices(),
    queryFn: async () => {
      const { data, status } = await authApi.getDevices();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch registered devices",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

/**
 * Get pending admin registrations review queue for Owner
 */
export function useOwnerReview(query: { token: string }) {
  return useQuery({
    queryKey: authQueryKeys.ownerReview(query),
    queryFn: async () => {
      const { data, status } = await authApi.ownerReview(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch owner review list",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!query.token,
  });
}

/**
 * List system users with pagination/filters
 */
export function useListUsers(query?: ListUsersQuery) {
  return useQuery({
    queryKey: authQueryKeys.users(query),
    queryFn: async () => {
      const { data, status } = await authApi.listUsers(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch users list",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

/**
 * Get user stats (totals, active, suspended, etc.)
 */
export function useUserStats() {
  return useQuery({
    queryKey: authQueryKeys.userStats(),
    queryFn: async () => {
      const { data, status } = await authApi.getUserStats();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch users stats",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

/**
 * Get user detail
 */
export function useAdminUserDetails(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userDetails(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserDetails(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user details",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Get user profile/activity overview stats
 */
export function useAdminUserOverview(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userOverview(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserOverview(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user overview",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Get user security logs
 */
export function useAdminUserSecurityLog(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userSecurity(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserSecurityLog(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user security history",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get active sessions of specific user
 */
export function useAdminUserSessions(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userSessions(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserSessions(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user sessions",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get registered devices of specific user
 */
export function useAdminUserDevices(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userDevices(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserDevices(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user devices",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get general user activity feed
 */
export function useAdminUserActivity(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userActivity(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserActivity(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user activity feed",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get user timeline transitions
 */
export function useAdminUserTimeline(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userTimeline(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserTimeline(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user timeline",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get specific user audit log history
 */
export function useAdminUserAuditLog(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userAudit(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserAuditLog(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user audit logs",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get specific user subscription details
 */
export function useAdminUserSubscription(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userSubscription(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserSubscription(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user subscription details",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Get warning notes recorded on specific user profile
 */
export function useAdminUserNotes(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userNotes(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserNotes(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user notes",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get assigned roles of specific user
 */
export function useAdminUserRoles(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userRoles(id),
    queryFn: async () => {
      const { data, status } = await authApi.getUserRoles(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user roles",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Preview compiled permissions of user
 */
export function useAdminUserPermissions(id: string) {
  return useQuery({
    queryKey: authQueryKeys.userPermissions(id),
    queryFn: async () => {
      const { data, status } = await authApi.previewUserPermissions(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user permissions preview",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
    enabled: !!id,
  });
}

/**
 * Get registration approval request detail
 */
export function useApprovalRequest(id: string) {
  return useQuery({
    queryKey: ["approval-request", id],
    queryFn: async () => {
      const { data, status } = await authApi.getApprovalRequest(id);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch approval request details",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Check if first-time system setup wizard is allowed
 */
export function useSetupAllowed() {
  return useQuery({
    queryKey: authQueryKeys.setupAllowed(),
    queryFn: async () => {
      const { data, status } = await authApi.checkSetupAllowed();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to check setup availability",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}
