import { useQuery } from '@tanstack/react-query';

import { AppError, ERROR_CODES, ErrorCode } from '@/lib/errors';
import { statesApi } from './api';
import { lookupQueryKeys } from './keys';

import type { StateQuery } from '../types';

export function useStates(query?: StateQuery) {
    return useQuery({
        queryKey: lookupQueryKeys.stateList(query),
        queryFn: async () => {
            const { data } = await statesApi.getStates(query);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

export function useCountries() {
    return useQuery({
        queryKey: lookupQueryKeys.countries(),
        queryFn: async () => {
            const { data, status: statusCode } = await statesApi.getCountries();

            if (data.success === false) {
                throw new AppError(
                    data.message || 'Failed to fetch countries',
                    statusCode,
                    ERROR_CODES.SERVER,
                );
            }

            const countries = data.data ?? [];
            return countries;
        },
    });
}