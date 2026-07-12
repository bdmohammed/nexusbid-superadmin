import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from './api';
import { notificationQueryKeys } from './keys';
import { AppError, ErrorCode } from '@/lib/errors';

export function useNotifications(filters?: any) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters),
    queryFn: async () => {
      const { data } = await notificationsApi.list(filters);
      // Backend returns directly list and total or mapped structure
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds cache duration
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationQueryKeys.stats(),
    queryFn: async () => {
      const { data } = await notificationsApi.getStatistics();
      return data;
    },
    staleTime: 1000 * 30,
  });
}

export function useNotificationCategories() {
  return useQuery({
    queryKey: notificationQueryKeys.categories(),
    queryFn: async () => {
      const { data } = await notificationsApi.getCategories();
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour static-ish
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: async () => {
      const { data } = await notificationsApi.getPreferences();
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
