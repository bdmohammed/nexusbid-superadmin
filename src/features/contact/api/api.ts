import { apiClient } from '@/lib/http';

import type { ApiResponse } from '@/types';

import type { ContactDto } from '../types';

export const supportApi = {
    submitContact(dto: ContactDto) {
        return apiClient.post<ApiResponse<null>>(
            '/support/contact',
            dto,
        );
    },
};