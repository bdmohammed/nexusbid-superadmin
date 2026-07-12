import { apiClient } from '@/lib/http';

import type {
    ApiResponse,
    SubscriptionPlan,
    BackendSubscription,
    AdminUserStats,
    PaginatedMeta
} from '@/types';

import type {
    Plan,
    CreateSubscriptionDto,
    CreateSubscriptionResponse,
    MySubscriptionResponse,
} from '../types';

export const subscriptionApi = {
    getPlans() {
        return apiClient.get<ApiResponse<Plan[]>>(
            '/subscriptions/plans',
        );
    },

    getMySubscription() {
        return apiClient.get<ApiResponse<MySubscriptionResponse>>(
            '/subscriptions/me',
        );
    },

    create(dto: CreateSubscriptionDto) {
        return apiClient.post<ApiResponse<CreateSubscriptionResponse>>(
            '/subscriptions',
            dto,
        );
    },

    cancel() {
        return apiClient.delete<ApiResponse<null>>(
            '/subscriptions/me',
        );
    },

    getAdminPlans() {
        return apiClient.get<ApiResponse<SubscriptionPlan[]>>(
            '/admin/plans',
        );
    },

    getAdminSubscriptions(page: number, limit: number) {
        return apiClient.get<ApiResponse<BackendSubscription[], PaginatedMeta>>(
            '/admin/subscriptions',
            { params: { page, limit } }
        );
    },

    getAdminUserStats() {
        return apiClient.get<ApiResponse<AdminUserStats>>(
            '/admin/users/stats',
        );
    },

    getAdminRevenueStats() {
        return apiClient.get<ApiResponse<any[]>>(
            '/admin/analytics/revenue',
        );
    },
};