import { useQuery } from '@tanstack/react-query';

import { categoryApi } from './api';
import { categoryQueryKeys } from './keys';
import { AppError } from '@/lib/errors/AppError';
import { ErrorCode } from '@/lib/errors/constants';

export function useCategories(query?: {
    search?: string;
    code?: string;
    slug?: string;
}) {
    return useQuery({
        queryKey: categoryQueryKeys.list(query),

        queryFn: async () => {
            const { data } = await categoryApi.getCategories(query);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}