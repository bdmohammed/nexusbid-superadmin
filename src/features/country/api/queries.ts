import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppError, ERROR_CODES, ErrorCode } from "@/lib/errors";
import { countriesApi } from "./api";
import { lookupQueryKeys } from "./keys";

import type {
  AddCommentInput,
  AssignReviewerInput,
  ChangeRequestQueryInput,
  CreateCountryChangeRequestInput,
  DependencyMatrixQueryInput,
  ReviewChangeRequestInput,
  StateQuery,
  UpdateCountryBodyDto,
  UpdateStateBodyDto,
} from "../types";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useStates(query?: StateQuery) {
  return useQuery({
    queryKey: lookupQueryKeys.stateList(query),
    queryFn: async () => {
      const { data } = await countriesApi.getStates(query);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
  });
}

export function useCountries() {
  return useQuery({
    queryKey: lookupQueryKeys.countries(),
    queryFn: async () => {
      const { data, status: statusCode } = await countriesApi.getCountries();

      if (data.success === false) {
        throw new AppError(
          data.message || "Failed to fetch countries",
          statusCode,
          ERROR_CODES.SERVER,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useCountriesHierarchy() {
  return useQuery({
    queryKey: lookupQueryKeys.hierarchy(),
    queryFn: async () => {
      const { data, status } = await countriesApi.getCountriesHierarchy();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch hierarchy",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useOperationalStats() {
  return useQuery({
    queryKey: lookupQueryKeys.stats(),
    queryFn: async () => {
      const { data, status } = await countriesApi.getOperationalStats();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch stats",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
  });
}

export function useEligibleReviewers() {
  return useQuery({
    queryKey: lookupQueryKeys.eligibleReviewers(),
    queryFn: async () => {
      const { data, status } = await countriesApi.getEligibleReviewers();

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch eligible reviewers",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useDependencyMatrix(query: DependencyMatrixQueryInput) {
  return useQuery({
    queryKey: lookupQueryKeys.dependencyMatrix(query),
    queryFn: async () => {
      const { data, status } = await countriesApi.getDependencyMatrix(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch dependency matrix",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
    enabled: !!query.countryId,
  });
}

export function useReviewsQueue(query?: ChangeRequestQueryInput) {
  return useQuery({
    queryKey: lookupQueryKeys.reviewsQueue(query),
    queryFn: async () => {
      const { data, status } = await countriesApi.getReviewsQueue(query);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch reviews queue",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
  });
}

export function useChangeRequestDetails(requestId: string) {
  return useQuery({
    queryKey: lookupQueryKeys.changeRequestDetails(requestId),
    queryFn: async () => {
      const { data, status } =
        await countriesApi.getChangeRequestDetails(requestId);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch change request details",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data;
    },
    enabled: !!requestId,
  });
}

export function useRequestTimeline(requestId: string) {
  return useQuery({
    queryKey: lookupQueryKeys.requestTimeline(requestId),
    queryFn: async () => {
      const { data, status } = await countriesApi.getRequestTimeline(requestId);

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch request timeline",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
    enabled: !!requestId,
  });
}

export function useLocationTimeline(countryId: string, stateId?: string) {
  return useQuery({
    queryKey: lookupQueryKeys.timeline(countryId, stateId),
    queryFn: async () => {
      const { data, status } = await countriesApi.getTimeline(
        countryId,
        stateId,
      );

      if (!data.success) {
        throw new AppError(
          data.message || "Failed to fetch location timeline",
          status,
          data.error as ErrorCode,
        );
      }

      return data.data ?? [];
    },
    enabled: !!countryId,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useCreateChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCountryChangeRequestInput) => {
      const { data } = await countriesApi.createChangeRequest(input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.reviewsQueue(),
      });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.hierarchy() });
    },
  });
}

export function useAssignReviewer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      input,
    }: {
      requestId: string;
      input: AssignReviewerInput;
    }) => {
      const { data } = await countriesApi.assignReviewer(requestId, input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.changeRequestDetails(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.reviewsQueue(),
      });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      input,
    }: {
      requestId: string;
      input: AddCommentInput;
    }) => {
      const { data } = await countriesApi.addComment(requestId, input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.changeRequestDetails(variables.requestId),
      });
    },
  });
}

export function useReviewChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      input,
    }: {
      requestId: string;
      input: ReviewChangeRequestInput;
    }) => {
      const { data } = await countriesApi.reviewChangeRequest(requestId, input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.changeRequestDetails(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: lookupQueryKeys.reviewsQueue(),
      });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.hierarchy() });
    },
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stateId,
      input,
    }: {
      stateId: string;
      input: UpdateStateBodyDto;
    }) => {
      const { data } = await countriesApi.updateState(stateId, input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.states() });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.hierarchy() });
    },
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      countryId,
      input,
    }: {
      countryId: string;
      input: UpdateCountryBodyDto;
    }) => {
      const { data } = await countriesApi.updateCountry(countryId, input);

      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.countries() });
      queryClient.invalidateQueries({ queryKey: lookupQueryKeys.hierarchy() });
    },
  });
}
