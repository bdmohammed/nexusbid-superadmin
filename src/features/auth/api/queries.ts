import { useQuery } from '@tanstack/react-query';

import { authApi } from './api';
import { authQueryKeys } from './keys';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Get currently authenticated user.
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: authQueryKeys.me(),

        queryFn: async () => {
            const { data } = await authApi.me();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

/**
 * Check whether user has a valid session.
 */
export function useSession() {
    return useQuery({
        queryKey: authQueryKeys.session(),

        queryFn: async () => {
            const { data } = await authApi.me();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },

        staleTime: Infinity,
        retry: false,
    });
}