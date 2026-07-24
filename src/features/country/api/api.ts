import { apiClient } from "@/lib/http";

import type { ApiResponse, State } from "@/types";
import type {
  ActivityItem,
  AddCommentInput,
  AssignReviewerInput,
  ChangeRequestQueryInput,
  CountryHierarchyNode,
  CreateCountryChangeRequestInput,
  DependencyMatrix,
  DependencyMatrixQueryInput,
  OperationalStats,
  ReviewChangeRequestInput,
  Reviewer,
  StateQuery,
  TicketItem,
  UpdateCountryBodyDto,
  UpdateStateBodyDto,
} from "../types";

export const countriesApi = {
  getStates(query?: StateQuery) {
    return apiClient.get<ApiResponse<State[]>>("/countries/states", {
      params: query,
    });
  },

  getCountries() {
    return apiClient.get<
      ApiResponse<
        { countryId: string; countryName: string; countryCode: string }[]
      >
    >("/countries");
  },

  getTimeline(countryId: string, stateId?: string) {
    return apiClient.get<ApiResponse<ActivityItem[]>>(
      `/countries/${countryId}/timeline`,
      {
        params: stateId ? { stateId } : undefined,
      },
    );
  },

  getCountriesHierarchy() {
    return apiClient.get<ApiResponse<CountryHierarchyNode[]>>(
      "/countries/hierarchy",
    );
  },

  getOperationalStats() {
    return apiClient.get<ApiResponse<OperationalStats>>("/countries/stats");
  },

  getEligibleReviewers() {
    return apiClient.get<ApiResponse<Reviewer[]>>(
      "/countries/eligible-reviewers",
    );
  },

  getDependencyMatrix(query: DependencyMatrixQueryInput) {
    return apiClient.get<ApiResponse<DependencyMatrix>>(
      "/countries/dependency-matrix",
      {
        params: query,
      },
    );
  },

  getReviewsQueue(query?: ChangeRequestQueryInput) {
    return apiClient.get<ApiResponse<TicketItem[]>>(
      "/countries/change-requests",
      {
        params: query,
      },
    );
  },

  getChangeRequestDetails(requestId: string) {
    return apiClient.get<ApiResponse<TicketItem>>(
      `/countries/change-requests/${requestId}`,
    );
  },

  createChangeRequest(input: CreateCountryChangeRequestInput) {
    return apiClient.post<ApiResponse<TicketItem>>(
      "/countries/change-requests",
      input,
    );
  },

  assignReviewer(requestId: string, input: AssignReviewerInput) {
    return apiClient.post<ApiResponse<TicketItem>>(
      `/countries/change-requests/${requestId}/assign`,
      input,
    );
  },

  addComment(requestId: string, input: AddCommentInput) {
    return apiClient.post<ApiResponse<any>>(
      `/countries/change-requests/${requestId}/comments`,
      input,
    );
  },

  reviewChangeRequest(requestId: string, input: ReviewChangeRequestInput) {
    return apiClient.post<ApiResponse<TicketItem>>(
      `/countries/change-requests/${requestId}/review`,
      input,
    );
  },

  getRequestTimeline(requestId: string) {
    return apiClient.get<ApiResponse<ActivityItem[]>>(
      `/countries/change-requests/${requestId}/timeline`,
    );
  },

  updateState(stateId: string, input: UpdateStateBodyDto) {
    return apiClient.patch<ApiResponse<State>>(
      `/countries/states/${stateId}`,
      input,
    );
  },

  updateCountry(countryId: string, input: UpdateCountryBodyDto) {
    return apiClient.patch<ApiResponse<any>>(`/countries/${countryId}`, input);
  },
};
