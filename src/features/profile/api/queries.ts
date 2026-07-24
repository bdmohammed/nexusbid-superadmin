import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppError, ErrorCode } from "@/lib/errors";
import { profileApi } from "./api";
import { profileQueryKeys } from "./keys";

import type {
  ChangePasswordInput,
  PageLimitQuery,
  RequestChangeInput,
  UpdateAvatarInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from "../types";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  return useQuery({
    queryKey: profileQueryKeys.details(),
    queryFn: async () => {
      const { data, status } = await profileApi.getProfile();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch profile details",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: profileQueryKeys.sessions(),
    queryFn: async () => {
      const { data, status } = await profileApi.getSessions();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user sessions",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useUserDevices() {
  return useQuery({
    queryKey: profileQueryKeys.devices(),
    queryFn: async () => {
      const { data, status } = await profileApi.getDevices();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user devices",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useUserActivity(query?: PageLimitQuery) {
  return useQuery({
    queryKey: profileQueryKeys.activity(query),
    queryFn: async () => {
      const { data, status } = await profileApi.getActivity(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user activity feed",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useUserSecurityHistory(query?: PageLimitQuery) {
  return useQuery({
    queryKey: profileQueryKeys.securityHistory(query),
    queryFn: async () => {
      const { data, status } = await profileApi.getSecurityHistory(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch security logs",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useUserTimeline() {
  return useQuery({
    queryKey: profileQueryKeys.timeline(),
    queryFn: async () => {
      const { data, status } = await profileApi.getTimeline();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch profile timeline",
          status,
          data.error as ErrorCode
        );
      }

      return data.data ?? [];
    },
  });
}

export function useUserSubscription() {
  return useQuery({
    queryKey: profileQueryKeys.subscription(),
    queryFn: async () => {
      const { data, status } = await profileApi.getSubscription();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch subscription details",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: profileQueryKeys.preferences(),
    queryFn: async () => {
      const { data, status } = await profileApi.getPreferences();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch user preferences",
          status,
          data.error as ErrorCode
        );
      }

      return data.data;
    },
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await profileApi.updateProfile(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.details() });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAvatarInput) => {
      const { data } = await profileApi.updateAvatar(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.details() });
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.removeAvatar();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.details() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const { data } = await profileApi.changePassword(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await profileApi.revokeSession(sessionId);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.sessions() });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.revokeAllSessions();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.sessions() });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      const { data } = await profileApi.updatePreferences(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.preferences() });
    },
  });
}

export function useRequestProfileChange() {
  return useMutation({
    mutationFn: async (input: RequestChangeInput) => {
      const { data } = await profileApi.requestChange(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.deactivateAccount();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useReactivateAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.reactivateAccount();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useDeleteAccountRequest() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.deleteRequest();

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}
