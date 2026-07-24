import { apiClient } from "@/lib/http";

import type { ApiResponse } from "@/types";
import type {
  ChangePasswordInput,
  PageLimitQuery,
  ProfileActivity,
  ProfileSubscriptionDetail,
  ProfileTimelineEvent,
  RequestChangeInput,
  UpdateAvatarInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserDevice,
  UserPreferences,
  UserProfile,
  UserSession,
} from "../types";

export const profileApi = {
  getProfile() {
    return apiClient.get<ApiResponse<UserProfile>>("/profile");
  },

  updateProfile(input: UpdateProfileInput) {
    return apiClient.patch<ApiResponse<UserProfile>>("/profile", input);
  },

  updateAvatar(input: UpdateAvatarInput) {
    return apiClient.post<ApiResponse<UserProfile>>("/profile/avatar", input);
  },

  removeAvatar() {
    return apiClient.delete<ApiResponse<UserProfile>>("/profile/avatar");
  },

  changePassword(input: ChangePasswordInput) {
    return apiClient.post<ApiResponse<any>>("/profile/change-password", input);
  },

  getSessions() {
    return apiClient.get<ApiResponse<UserSession[]>>("/profile/sessions");
  },

  revokeSession(sessionId: string) {
    return apiClient.delete<ApiResponse<any>>(`/profile/sessions/${sessionId}`);
  },

  revokeAllSessions() {
    return apiClient.delete<ApiResponse<any>>("/profile/sessions");
  },

  getDevices() {
    return apiClient.get<ApiResponse<UserDevice[]>>("/profile/devices");
  },

  getActivity(query?: PageLimitQuery) {
    return apiClient.get<ApiResponse<ProfileActivity[]>>("/profile/activity", {
      params: query,
    });
  },

  getSecurityHistory(query?: PageLimitQuery) {
    return apiClient.get<ApiResponse<ProfileActivity[]>>("/profile/security-history", {
      params: query,
    });
  },

  getTimeline() {
    return apiClient.get<ApiResponse<ProfileTimelineEvent[]>>("/profile/timeline");
  },

  getSubscription() {
    return apiClient.get<ApiResponse<ProfileSubscriptionDetail>>("/profile/subscription");
  },

  getPreferences() {
    return apiClient.get<ApiResponse<UserPreferences>>("/profile/preferences");
  },

  updatePreferences(input: UpdatePreferencesInput) {
    return apiClient.patch<ApiResponse<UserPreferences>>("/profile/preferences", input);
  },

  requestChange(input: RequestChangeInput) {
    return apiClient.post<ApiResponse<any>>("/profile/request-change", input);
  },

  deactivateAccount() {
    return apiClient.post<ApiResponse<any>>("/profile/deactivate");
  },

  reactivateAccount() {
    return apiClient.post<ApiResponse<any>>("/profile/reactivate");
  },

  deleteRequest() {
    return apiClient.post<ApiResponse<any>>("/profile/delete-request");
  },

  exportData() {
    return apiClient.get<any>("/profile/export", {
      responseType: "blob",
    });
  },
};
