import { apiClient } from '@/lib/http';

import type {
    ApiResponse,
    Tender,
} from '@/types';

import type {
    TenderDownloadResponse,
    TenderDetailsResponse,
    TenderQueryDto,
} from '../types';

export const tenderApi = {
    list(query?: TenderQueryDto) {
        return apiClient.get<ApiResponse<Tender[]>>('/tenders', {
            params: query,
        });
    },

    getBySlug(slug: string) {
        return apiClient.get<ApiResponse<TenderDetailsResponse>>(
            `/tenders/${slug}`,
        );
    },

    getDownloadUrl(id: string) {
        return apiClient.get<ApiResponse<TenderDownloadResponse>>(
            `/tenders/${id}/download-url`,
        );
    },
};