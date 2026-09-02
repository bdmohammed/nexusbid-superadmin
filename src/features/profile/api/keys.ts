import type { PageLimitQuery } from '../types';

export const profileQueryKeys = {
  all: ['profile'] as const,
  details: () => [...profileQueryKeys.all, 'details'] as const,
  sessions: () => [...profileQueryKeys.all, 'sessions'] as const,
  devices: () => [...profileQueryKeys.all, 'devices'] as const,
  activity: (query?: PageLimitQuery) => [...profileQueryKeys.all, 'activity', query] as const,
  securityHistory: (query?: PageLimitQuery) =>
    [...profileQueryKeys.all, 'security-history', query] as const,
  timeline: () => [...profileQueryKeys.all, 'timeline'] as const,
  subscription: () => [...profileQueryKeys.all, 'subscription'] as const,
  preferences: () => [...profileQueryKeys.all, 'preferences'] as const,
};
