import { apiClient } from '@/lib/http';

import type { ApiResponse, Category } from '@/types';
import { CategoryQuery } from '../types';

export const categoryApi = {
    async getCategories(query?: CategoryQuery) {
        return apiClient.get<ApiResponse<{ categories: Category[]; total: number }>>('/categories', {
            params: query,
        });
    },
};