import { apiClient } from '@/lib/http';
import type { ApiResponse } from '@/types';

export const notificationsApi = {
  list: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/notifications', { params }),

  getStatistics: () =>
    apiClient.get<any>('/notifications/statistics'),

  getCategories: () =>
    apiClient.get<any[]>('/notifications/categories'),

  markRead: (id: string) =>
    apiClient.patch<any>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch<any>('/notifications/read-all'),

  archive: (id: string) =>
    apiClient.patch<any>(`/notifications/${id}/archive`),

  dismiss: (id: string) =>
    apiClient.patch<any>(`/notifications/${id}/dismiss`),

  executeAction: (id: string, actionId: string) =>
    apiClient.post<any>(`/notifications/${id}/actions/${actionId}/execute`),

  getPreferences: () =>
    apiClient.get<any>('/notifications/preferences'),

  updatePreferences: (data: any) =>
    apiClient.patch<any>('/notifications/preferences', data),
};
