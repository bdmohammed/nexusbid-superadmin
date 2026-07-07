import { useQuery } from '@tanstack/react-query';

import { subscriptionApi } from './api';
import { subscriptionQueryKeys } from './keys';
import { AppError, ErrorCode } from '@/lib/errors';

export function usePlans() {
    return useQuery({
        queryKey: subscriptionQueryKeys.plans(),

        queryFn: async () => {
            const { data } = await subscriptionApi.getPlans();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

export function useMySubscription() {
    return useQuery({
        queryKey: subscriptionQueryKeys.me(),

        queryFn: async () => {
            const { data } = await subscriptionApi.getMySubscription();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}