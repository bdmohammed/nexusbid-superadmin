import { useQuery } from '@tanstack/react-query';

import { tenderApi } from './api';
import { tenderQueryKeys } from './keys';

import type { TenderQueryDto, TenderSearchQueryDto } from '../types';
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

export function useTenderStatistics() {
    return useQuery({
        queryKey: tenderQueryKeys.statistics(),
        queryFn: async () => {
            const { data } = await tenderApi.getStatistics();
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

export function useAdminTenders(query?: TenderSearchQueryDto) {
    return useQuery({
        queryKey: tenderQueryKeys.adminList(query),
        queryFn: async () => {
            const { data } = await tenderApi.adminList(query);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return {
                data: data.data,
                meta: data.meta,
            };
        },
    });
}

export function useAdminTender(id: string) {
    return useQuery({
        queryKey: tenderQueryKeys.adminDetail(id),
        queryFn: async () => {
            const { data } = await tenderApi.adminGetById(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        enabled: !!id,
    });
}

export function useTenderHistory(id: string) {
    return useQuery({
        queryKey: tenderQueryKeys.history(id),
        queryFn: async () => {
            const { data } = await tenderApi.getHistory(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data ?? [];
        },
        enabled: !!id,
    });
}

export function useTenderDiff(id: string) {
    return useQuery({
        queryKey: tenderQueryKeys.diff(id),
        queryFn: async () => {
            const { data } = await tenderApi.getDiff(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        enabled: !!id,
    });
}

export function useTenderReportBudget() {
    return useQuery({
        queryKey: tenderQueryKeys.reports('budget'),
        queryFn: async () => {
            const { data } = await tenderApi.getReportBudget();
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

export function useTenderReportStatus() {
    return useQuery({
        queryKey: tenderQueryKeys.reports('status'),
        queryFn: async () => {
            const { data } = await tenderApi.getReportStatus();
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

export function useTenderReportVendors() {
    return useQuery({
        queryKey: tenderQueryKeys.reports('vendors'),
        queryFn: async () => {
            const { data } = await tenderApi.getReportVendors();
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

export function useTenderReportPerformance() {
    return useQuery({
        queryKey: tenderQueryKeys.reports('performance'),
        queryFn: async () => {
            const { data } = await tenderApi.getReportPerformance();
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}