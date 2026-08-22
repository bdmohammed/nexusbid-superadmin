import type {
  ChangeRequestQueryInput,
  DependencyMatrixQueryInput,
} from "../types";

export const lookupQueryKeys = {
  all: ["lookups"] as const,

  states: () => [...lookupQueryKeys.all, "states"] as const,
  stateList: (query?: unknown) => [...lookupQueryKeys.states(), query] as const,

  countries: () => [...lookupQueryKeys.all, "countries"] as const,

  hierarchy: () => [...lookupQueryKeys.all, "hierarchy"] as const,
  stats: () => [...lookupQueryKeys.all, "stats"] as const,
  eligibleReviewers: () =>
    [...lookupQueryKeys.all, "eligible-reviewers"] as const,

  dependencyMatrix: (query?: DependencyMatrixQueryInput) =>
    [...lookupQueryKeys.all, "dependency-matrix", query] as const,

  reviewsQueue: (query?: ChangeRequestQueryInput) =>
    [...lookupQueryKeys.all, "reviews-queue", query] as const,

  changeRequestDetails: (requestId: string) =>
    [...lookupQueryKeys.all, "change-request", requestId] as const,

  requestTimeline: (requestId: string) =>
    [...lookupQueryKeys.all, "request-timeline", requestId] as const,

  timeline: (countryId: string, stateId?: string) =>
    [...lookupQueryKeys.all, "timeline", countryId, stateId] as const,
};
