import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import { subscriptionApi } from './api';
import { subscriptionQueryKeys } from './keys';
import { authQueryKeys } from '@/features/auth/api/keys';

import type {
    CreateSubscriptionDto,
    CreatePlanInput,
    CreatePlanVersionDraftInput,
    AssignReviewerInput,
    SubmitReviewActionInput,
    SubscriptionMigrationInput,
    UpdatePlanLegacyInput,
} from '../types';
import { AppError, ErrorCode } from '@/lib/errors';

export function useCreateSubscription() {
    return useMutation({
        mutationFn: async (dto: CreateSubscriptionDto) => {
            const { data } = await subscriptionApi.create(dto);

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },
    });
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await subscriptionApi.cancel();

            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }

            return data.data;
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: subscriptionQueryKeys.me(),
            });

            await queryClient.invalidateQueries({
                queryKey: authQueryKeys.me(),
            });
        },
    });
}

/**
 * Add feature to plans catalog
 */
export function useCreateFeatureCatalogItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { key: string; name: string; description?: string }) => {
            const { data } = await subscriptionApi.createFeatureCatalogItem(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.features() });
        },
    });
}

/**
 * Create coupon discount
 */
export function useCreateCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { code: string; type: 'percentage' | 'fixed'; value: number }) => {
            const { data } = await subscriptionApi.createCoupon(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.coupons() });
        },
    });
}

/**
 * Toggle coupon status
 */
export function useToggleCouponStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await subscriptionApi.toggleCouponStatus(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.coupons() });
        },
    });
}

/**
 * Initiate subscriptions migration
 */
export function useInitiateSubscriptionMigration() {
    return useMutation({
        mutationFn: async (input: SubscriptionMigrationInput) => {
            const { data } = await subscriptionApi.initiateSubscriptionMigration(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

/**
 * Create a plan draft
 */
export function useCreatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreatePlanInput) => {
            const { data } = await subscriptionApi.createPlan(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.adminPlans() });
        },
    });
}

/**
 * Create new plan version draft
 */
export function useCreatePlanVersionDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: CreatePlanVersionDraftInput }) => {
            const { data } = await subscriptionApi.createPlanVersionDraft(id, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.planDetails(variables.id) });
        },
    });
}

/**
 * Submit plan version for review
 */
export function useSubmitPlanForReview() {
    return useMutation({
        mutationFn: async (versionId: string) => {
            const { data } = await subscriptionApi.submitPlanForReview(versionId);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

/**
 * Assign plan reviewer
 */
export function useAssignPlanReviewer() {
    return useMutation({
        mutationFn: async ({ reviewId, input }: { reviewId: string; input: AssignReviewerInput }) => {
            const { data } = await subscriptionApi.assignPlanReviewer(reviewId, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
    });
}

/**
 * Submit plan review decision
 */
export function useSubmitPlanReviewAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId, input }: { reviewId: string; input: SubmitReviewActionInput }) => {
            const { data } = await subscriptionApi.submitPlanReviewAction(reviewId, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.adminPlans() });
        },
    });
}

/**
 * Publish approved plan version
 */
export function usePublishPlanVersion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (versionId: string) => {
            const { data } = await subscriptionApi.publishPlanVersion(versionId);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.adminPlans() });
        },
    });
}

/**
 * Create legacy plan
 */
export function useCreatePlanLegacy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreatePlanInput) => {
            const { data } = await subscriptionApi.createPlanLegacy(input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.adminPlans() });
        },
    });
}

/**
 * Update legacy plan details
 */
export function useUpdatePlanLegacy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdatePlanLegacyInput }) => {
            const { data } = await subscriptionApi.updatePlanLegacy(id, input);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.adminPlans() });
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.planDetails(variables.id) });
        },
    });
}
