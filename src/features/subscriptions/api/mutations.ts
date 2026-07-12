import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import { subscriptionApi } from './api';
import { subscriptionQueryKeys } from './keys';
import { authQueryKeys } from '@/features/auth/api/keys';

import type {
    CreateSubscriptionDto,
} from '../types';
import { AppError, ErrorCode } from '@/lib/errors';

export function useCreateSubscription() {
    return useMutation({
        mutationFn: async (dto: CreateSubscriptionDto) => {
            const { data } = await subscriptionApi.create(dto);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await subscriptionApi.cancel();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: subscriptionQueryKeys.me(),
            });

            await queryClient.invalidateQueries({
                queryKey: authQueryKeys.me(),
            });
        },
    });
}
