import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tenderApi } from './api';
import { tenderQueryKeys } from './keys';

import type {
  AnswerQuestionDto,
  AssignReviewerDto,
  CreateAmendmentDto,
  CreateClarificationDto,
  CreateQuestionDto,
  CreateTenderDto,
  RegisterDocumentDto,
  SubmitEvaluationDto,
  SubmitReviewCommentDto,
  TenderCommitteeDto,
  TenderInvitationDto,
  TenderTemplateDto,
  TenderWatcherDto,
  UpdateTenderDto,
  UpdateTenderStatusDto,
  UploadUrlDto,
} from '../types';
import type { ErrorCode } from '@/lib/errors';
import { AppError } from '@/lib/errors';

export function useDownloadTender() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await tenderApi.getDownloadUrl(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data.downloadUrl;
    },
  });
}

export function usePostQuestion() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CreateQuestionDto }) => {
      const { data } = await tenderApi.postQuestion(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useToggleWatcher() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TenderWatcherDto }) => {
      const { data } = await tenderApi.toggleWatcher(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useAdminGetUploadUrl() {
  return useMutation({
    mutationFn: async (input: UploadUrlDto) => {
      const { data } = await tenderApi.adminGetUploadUrl(input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useAdminRegisterDocument() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RegisterDocumentDto }) => {
      const { data } = await tenderApi.adminRegisterDocument(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useAdminCreateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTenderDto) => {
      const { data } = await tenderApi.adminCreate(input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
    },
  });
}

export function useAdminUpdateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTenderDto }) => {
      const { data } = await tenderApi.adminUpdate(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useAdminDeleteTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await tenderApi.adminDelete(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
    },
  });
}

export function useAdminUpdateTenderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTenderStatusDto }) => {
      const { data } = await tenderApi.adminUpdateStatus(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useCancelTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await tenderApi.cancelTender(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(id),
      });
    },
  });
}

export function useDuplicateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await tenderApi.duplicateTender(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenderQueryKeys.adminList() });
    },
  });
}

export function useScheduleTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: { publishAt: string; closeAt: string };
    }) => {
      const { data } = await tenderApi.scheduleTender(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useAnswerQuestion() {
  return useMutation({
    mutationFn: async ({ qId, input }: { qId: string; input: AnswerQuestionDto }) => {
      const { data } = await tenderApi.answerQuestion(qId, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useCreateClarification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CreateClarificationDto }) => {
      const { data } = await tenderApi.createClarification(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useCreateAmendment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CreateAmendmentDto }) => {
      const { data } = await tenderApi.createAmendment(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.history(variables.id),
      });
    },
  });
}

export function useAssignReviewers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AssignReviewerDto }) => {
      const { data } = await tenderApi.assignReviewers(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useSubmitReviewComment() {
  return useMutation({
    mutationFn: async ({
      reviewId,
      input,
    }: {
      reviewId: string;
      input: SubmitReviewCommentDto;
    }) => {
      const { data } = await tenderApi.submitReviewComment(reviewId, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useAddCommitteeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TenderCommitteeDto }) => {
      const { data } = await tenderApi.addCommitteeMember(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tenderQueryKeys.adminDetail(variables.id),
      });
    },
  });
}

export function useSubmitEvaluation() {
  return useMutation({
    mutationFn: async ({
      participantId,
      input,
    }: {
      participantId: string;
      input: SubmitEvaluationDto;
    }) => {
      const { data } = await tenderApi.submitEvaluation(participantId, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useInviteTender() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TenderInvitationDto }) => {
      const { data } = await tenderApi.inviteTender(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

export function useCreateTemplate() {
  return useMutation({
    mutationFn: async (input: TenderTemplateDto) => {
      const { data } = await tenderApi.createTemplate(input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}
