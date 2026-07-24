import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { categoryApi } from './api';
import { categoryQueryKeys } from './keys';
import { AppError } from '@/lib/errors/AppError';
import { ErrorCode } from '@/lib/errors/constants';
import type {
    BatchCategoryItem,
    CategoryDecisionInput,
    CategoryQuery,
    CreateCategoryInput,
    SubmitCategoryReviewInput,
    UpdateCategoryInput,
} from '../types';

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useCategories(query?: CategoryQuery) {
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

export function useCategoryStats() {
    return useQuery({
        queryKey: categoryQueryKeys.stats(),
        queryFn: async () => {
            const { data } = await categoryApi.getCategoryStats();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

export function useCategoryHistory(id: string) {
    return useQuery({
        queryKey: categoryQueryKeys.history(id),
        queryFn: async () => {
            const { data } = await categoryApi.getCategoryHistory(id);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data ?? [];
        },
        enabled: !!id,
    });
}

export function useCategoryGovernance(id: string) {
    return useQuery({
        queryKey: categoryQueryKeys.governance(id),
        queryFn: async () => {
            const { data } = await categoryApi.getCategoryGovernance(id);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
        enabled: !!id,
    });
}

export function useCategoryUsage(id: string) {
    return useQuery({
        queryKey: categoryQueryKeys.usage(id),
        queryFn: async () => {
            const { data } = await categoryApi.getCategoryUsage(id);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
        enabled: !!id,
    });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateCategoryInput) => {
            const { data } = await categoryApi.createCategory(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
        },
    });
}

export function useBatchCategories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ payload, isCsv }: { payload: BatchCategoryItem[] | string; isCsv?: boolean }) => {
            const { data } = await categoryApi.batchCategories(payload, isCsv);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateCategoryInput }) => {
            const { data } = await categoryApi.updateCategory(id, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.history(variables.id) });
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(variables.id) });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await categoryApi.deleteCategory(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
        },
    });
}

export function useSubmitCategoryReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: SubmitCategoryReviewInput }) => {
            const { data } = await categoryApi.submitCategoryReview(id, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(variables.id) });
        },
    });
}

export function useAssignCategoryReviewer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, reviewerIds }: { id: string; reviewerIds: string[] }) => {
            const { data } = await categoryApi.assignCategoryReviewer(id, reviewerIds);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(variables.id) });
        },
    });
}

export function useReviewCategoryDecision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: CategoryDecisionInput }) => {
            const { data } = await categoryApi.reviewCategoryDecision(id, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(variables.id) });
        },
    });
}

export function useCreateCategoryDraftVersion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await categoryApi.createCategoryDraftVersion(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(id) });
        },
    });
}

export function useArchiveCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await categoryApi.archiveCategory(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(id) });
        },
    });
}

export function useRestoreCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await categoryApi.restoreCategory(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: categoryQueryKeys.governance(id) });
        },
    });
}