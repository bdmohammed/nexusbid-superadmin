import { apiClient } from '@/lib/http';

import type {
    ApiResponse
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
};