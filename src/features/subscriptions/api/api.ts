import type {
  AssignReviewerInput,
  Coupon,
  CreatePlanInput,
  CreatePlanVersionDraftInput,
  CreateSubscriptionDto,
  CreateSubscriptionResponse,
  MySubscriptionResponse,
  Plan,
  PlanFeatureCatalogItem,
  SubmitReviewActionInput,
  SubscriptionDashboardStats,
  SubscriptionMigrationInput,
  UpdatePlanLegacyInput,
} from "../types";
import type {
  AdminUserStats,
  ApiResponse,
  BackendSubscription,
  PaginatedMeta,
  SubscriptionPlan,
} from "@/types";
import { apiClient } from "@/lib/http";

export const subscriptionApi = {
  getPlans() {
    return apiClient.get<ApiResponse<Plan[]>>("/subscriptions/plans");
  },

  getMySubscription() {
    return apiClient.get<ApiResponse<MySubscriptionResponse>>(
      "/subscriptions/me",
    );
  },

  create(dto: CreateSubscriptionDto) {
    return apiClient.post<ApiResponse<CreateSubscriptionResponse>>(
      "/subscriptions",
      dto,
    );
  },

  cancel() {
    return apiClient.delete<ApiResponse<null>>("/subscriptions/me");
  },

  getAdminPlans() {
    return apiClient.get<ApiResponse<SubscriptionPlan[]>>("/plans/plans");
  },

  getAdminSubscriptions(page: number, limit: number) {
    return apiClient.get<ApiResponse<BackendSubscription[], PaginatedMeta>>(
      "/subscriptions",
      { params: { page, limit } },
    );
  },

  getAdminUserStats() {
    return apiClient.get<ApiResponse<AdminUserStats>>("/admin/users/stats");
  },

  getAdminRevenueStats() {
    return apiClient.get<ApiResponse<any[]>>("/analytics/revenue");
  },

  getSubscriptionsDashboardStats() {
    return apiClient.get<ApiResponse<SubscriptionDashboardStats>>(
      "/plans/dashboard",
    );
  },

  getFeatureCatalog() {
    return apiClient.get<ApiResponse<PlanFeatureCatalogItem[]>>(
      "/plans/features",
    );
  },

  createFeatureCatalogItem(input: {
    key: string;
    name: string;
    description?: string;
  }) {
    return apiClient.post<ApiResponse<PlanFeatureCatalogItem>>(
      "/plans/features",
      input,
    );
  },

  listCoupons() {
    return apiClient.get<ApiResponse<Coupon[]>>("/plans/coupons");
  },

  createCoupon(input: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
  }) {
    return apiClient.post<ApiResponse<Coupon>>("/plans/coupons", input);
  },

  toggleCouponStatus(id: string) {
    return apiClient.post<ApiResponse<any>>(`/plans/coupons/${id}/toggle`);
  },

  initiateSubscriptionMigration(input: SubscriptionMigrationInput) {
    return apiClient.post<ApiResponse<any>>("/plans/migrations", input);
  },

  listAllPlans() {
    return apiClient.get<ApiResponse<Plan[]>>("/plans");
  },

  getPlanById(id: string) {
    return apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
  },

  createPlan(input: CreatePlanInput) {
    return apiClient.post<ApiResponse<Plan>>("/plans", input);
  },

  createPlanVersionDraft(id: string, input: CreatePlanVersionDraftInput) {
    return apiClient.post<ApiResponse<any>>(`/plans/${id}/versions`, input);
  },

  submitPlanForReview(versionId: string) {
    return apiClient.post<ApiResponse<any>>(
      `/plans/versions/${versionId}/submit`,
    );
  },

  assignPlanReviewer(reviewId: string, input: AssignReviewerInput) {
    return apiClient.post<ApiResponse<any>>(
      `/plans/reviews/${reviewId}/assign`,
      input,
    );
  },

  submitPlanReviewAction(reviewId: string, input: SubmitReviewActionInput) {
    return apiClient.post<ApiResponse<any>>(
      `/plans/reviews/${reviewId}/action`,
      input,
    );
  },

  publishPlanVersion(versionId: string) {
    return apiClient.post<ApiResponse<any>>(
      `/plans/versions/${versionId}/publish`,
    );
  },

  createPlanLegacy(input: CreatePlanInput) {
    return apiClient.post<ApiResponse<Plan>>("/plans/plans", input);
  },

  updatePlanLegacy(id: string, input: UpdatePlanLegacyInput) {
    return apiClient.patch<ApiResponse<Plan>>(`/plans/plans/${id}`, input);
  },
};
