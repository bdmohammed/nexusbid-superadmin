import { useQuery } from '@tanstack/react-query';

import { tenderApi } from './api';
import { tenderQueryKeys } from './keys';

import type { TenderQueryDto } from '../types';
import { AppError, ErrorCode } from '@/lib/errors';

export function useTenders(query?: TenderQueryDto) {
    return useQuery({
        queryKey: tenderQueryKeys.list(query),

        queryFn: async () => {
            const { data } = await tenderApi.list(query);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data;
        },

        staleTime: 1000 * 60,
    });
}

export function useTender(slug: string) {
    return useQuery({
        queryKey: tenderQueryKeys.detail(slug),

        queryFn: async () => {
            const { data } = await tenderApi.getBySlug(slug);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },

        enabled: Boolean(slug),

        staleTime: 1000 * 60 * 5,
    });
}