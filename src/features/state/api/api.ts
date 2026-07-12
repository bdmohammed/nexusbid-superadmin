import { apiClient } from '@/lib/http';

import type {
    ApiResponse,
    State,
} from '@/types';

import type {
    StateQuery,
} from '../types';

export const statesApi = {
    getStates(query?: StateQuery) {
        return apiClient.get<ApiResponse<State[]>>('/states', {
            params: query,
        });
    },
    getCountries() {
        return apiClient.get<ApiResponse<string[]>>('/states/countries');
    },
};