import type {
  NotificationCategory,
  NotificationPreferences,
  NotificationsListResponse,
  NotificationStats,
} from '../types';
import { apiClient } from '@/lib/http';

export const notificationsApi = {
  list: (params?: any) => apiClient.get<NotificationsListResponse>('/notifications', { params }),

  getStatistics: () => apiClient.get<NotificationStats>('/notifications/statistics'),

  getCategories: () => apiClient.get<NotificationCategory[]>('/notifications/categories'),

  markRead: (id: string) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch<{ success: boolean; message?: string }>('/notifications/read-all'),

  archive: (id: string) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/archive`),

  dismiss: (id: string) =>
    apiClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/dismiss`),

  executeAction: (id: string, actionId: string) =>
    apiClient.post<{ success: boolean; message?: string }>(
      `/notifications/${id}/actions/${actionId}/execute`,
    ),

  getPreferences: () => apiClient.get<NotificationPreferences>('/notifications/preferences'),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    apiClient.patch<NotificationPreferences>('/notifications/preferences', data),
};
