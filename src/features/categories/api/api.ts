import type {
  BatchCategoriesResult,
  BatchCategoryItem,
  CategoryDecisionInput,
  CategoryGovernance,
  CategoryHistoryItem,
  CategoryQuery,
  CategoryStats,
  CreateCategoryInput,
  SubmitCategoryReviewInput,
  UpdateCategoryInput,
} from "../types";
import type { ApiResponse, Category } from "@/types";
import { apiClient } from "@/lib/http";

export const categoryApi = {
  getCategories(query?: CategoryQuery) {
    return apiClient.get<
      ApiResponse<{ categories: Category[]; total: number }>
    >("/categories", {
      params: query,
    });
  },

  getCategoryStats() {
    return apiClient.get<ApiResponse<CategoryStats>>("/categories/analytics");
  },

  createCategory(input: CreateCategoryInput) {
    return apiClient.post<ApiResponse<Category>>("/categories", input);
  },

  batchCategories(payload: BatchCategoryItem[] | string, isCsv = false) {
    return apiClient.post<ApiResponse<BatchCategoriesResult>>(
      "/categories/batch",
      payload,
      {
        headers: {
          "Content-Type": isCsv ? "text/csv" : "application/json",
        },
      },
    );
  },

  updateCategory(id: string, input: UpdateCategoryInput) {
    return apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, input);
  },

  deleteCategory(id: string) {
    return apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
  },

  getCategoryHistory(id: string) {
    return apiClient.get<ApiResponse<CategoryHistoryItem[]>>(
      `/categories/${id}/history`,
    );
  },

  getCategoryGovernance(id: string) {
    return apiClient.get<ApiResponse<CategoryGovernance>>(
      `/categories/${id}/governance`,
    );
  },

  submitCategoryReview(id: string, input: SubmitCategoryReviewInput) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/submit`, input);
  },

  addCategoryComment(id: string, comment: string) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/comments`, {
      comment,
    });
  },

  assignCategoryReviewer(id: string, reviewerIds: string[]) {
    return apiClient.post<ApiResponse<any>>(
      `/categories/${id}/assign-reviewer`,
      { reviewerIds },
    );
  },

  reviewCategoryDecision(id: string, input: CategoryDecisionInput) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/review`, input);
  },

  createCategoryDraftVersion(id: string) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/draft`);
  },

  archiveCategory(id: string) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/archive`);
  },

  restoreCategory(id: string) {
    return apiClient.post<ApiResponse<any>>(`/categories/${id}/restore`);
  },

  getCategoryUsage(id: string) {
    return apiClient.get<ApiResponse<any>>(`/categories/${id}/usage`);
  },
};
