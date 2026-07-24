import { apiClient } from "@/lib/http";

import type { ApiResponse, Tender, PaginatedMeta } from "@/types";

import type {
  TenderDownloadResponse,
  TenderDetailsResponse,
  TenderQueryDto,
  TenderSearchQueryDto,
  CreateTenderDto,
  UpdateTenderDto,
  UpdateTenderStatusDto,
  UploadUrlDto,
  UploadUrlResponse,
  RegisterDocumentDto,
  CreateQuestionDto,
  AnswerQuestionDto,
  CreateClarificationDto,
  CreateAmendmentDto,
  AssignReviewerDto,
  SubmitReviewCommentDto,
  TenderCommitteeDto,
  SubmitEvaluationDto,
  TenderWatcherDto,
  TenderInvitationDto,
  TenderTemplateDto,
  TenderHistoryLog,
  TenderDiffResponse,
  TenderReport,
} from "../types";

export const tenderApi = {
  list(query?: TenderQueryDto) {
    return apiClient.get<ApiResponse<Tender[]>>("/tenders", {
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

  getStatistics() {
    return apiClient.get<ApiResponse<any>>("/tenders/statistics");
  },

  postQuestion(id: string, input: CreateQuestionDto) {
    return apiClient.post<ApiResponse<any>>(`/tenders/${id}/questions`, input);
  },

  toggleWatcher(id: string, input: TenderWatcherDto) {
    return apiClient.post<ApiResponse<any>>(`/tenders/${id}/watch`, input);
  },

  adminGetUploadUrl(input: UploadUrlDto) {
    return apiClient.post<ApiResponse<UploadUrlResponse>>(
      "/tenders/admin/upload-url",
      input,
    );
  },

  adminRegisterDocument(id: string, input: RegisterDocumentDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/documents`,
      input,
    );
  },

  adminGetDocuments(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/tenders/admin/${id}/documents`);
  },

  adminDeleteDocument(docId: string) {
    return apiClient.delete<ApiResponse<any>>(
      `/tenders/admin/documents/${docId}`,
    );
  },

  adminList(query?: TenderSearchQueryDto) {
    return apiClient.get<ApiResponse<Tender[], PaginatedMeta>>(
      "/tenders/admin",
      {
        params: query,
      },
    );
  },

  adminCreate(input: CreateTenderDto) {
    return apiClient.post<ApiResponse<Tender>>("/tenders/admin", input);
  },

  adminGetById(id: string) {
    return apiClient.get<ApiResponse<Tender>>(`/tenders/admin/${id}`);
  },

  adminUpdate(id: string, input: UpdateTenderDto) {
    return apiClient.patch<ApiResponse<Tender>>(`/tenders/admin/${id}`, input);
  },

  adminDelete(id: string) {
    return apiClient.delete<ApiResponse<any>>(`/tenders/admin/${id}`);
  },

  adminUpdateStatus(id: string, input: UpdateTenderStatusDto) {
    return apiClient.patch<ApiResponse<any>>(
      `/tenders/admin/${id}/status`,
      input,
    );
  },

  cancelTender(id: string) {
    return apiClient.post<ApiResponse<any>>(`/tenders/admin/${id}/cancel`);
  },

  duplicateTender(id: string) {
    return apiClient.post<ApiResponse<Tender>>(
      `/tenders/admin/${id}/duplicate`,
    );
  },

  getDiff(id: string) {
    return apiClient.get<ApiResponse<TenderDiffResponse>>(
      `/tenders/admin/${id}/diff`,
    );
  },

  getHistory(id: string) {
    return apiClient.get<ApiResponse<TenderHistoryLog[]>>(
      `/tenders/admin/${id}/history`,
    );
  },

  scheduleTender(id: string, input: { publishAt: string; closeAt: string }) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/schedule`,
      input,
    );
  },

  answerQuestion(qId: string, input: AnswerQuestionDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/questions/${qId}/answer`,
      input,
    );
  },

  createClarification(id: string, input: CreateClarificationDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/clarifications`,
      input,
    );
  },

  createAmendment(id: string, input: CreateAmendmentDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/amendments`,
      input,
    );
  },

  assignReviewers(id: string, input: AssignReviewerDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/assign`,
      input,
    );
  },

  submitReviewComment(reviewId: string, input: SubmitReviewCommentDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/reviews/${reviewId}/comments`,
      input,
    );
  },

  addCommitteeMember(id: string, input: TenderCommitteeDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/committee`,
      input,
    );
  },

  submitEvaluation(participantId: string, input: SubmitEvaluationDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/participants/${participantId}/evaluate`,
      input,
    );
  },

  inviteTender(id: string, input: TenderInvitationDto) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/invitations`,
      input,
    );
  },

  createTemplate(input: TenderTemplateDto) {
    return apiClient.post<ApiResponse<any>>("/tenders/admin/templates", input);
  },

  getReportBudget() {
    return apiClient.get<ApiResponse<TenderReport>>(
      "/tenders/admin/reports/budget",
    );
  },

  getReportStatus() {
    return apiClient.get<ApiResponse<TenderReport>>(
      "/tenders/admin/reports/status",
    );
  },

  getReportVendors() {
    return apiClient.get<ApiResponse<TenderReport>>(
      "/tenders/admin/reports/vendors",
    );
  },

  submitForReview(id: string) {
    return apiClient.post<ApiResponse<any>>(
      `/tenders/admin/${id}/submit-review`,
    );
  },

  getReviews(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/tenders/admin/${id}/reviews`);
  },

  submitReviewDecision(
    reviewId: string,
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    commentText?: string,
  ) {
    return apiClient.patch<ApiResponse<any>>(
      `/tenders/admin/reviews/${reviewId}/decisions`,
      {
        decision,
        commentText,
      },
    );
  },

  getVersionDiff(id: string, v1: number = 1, v2: number = 2) {
    return apiClient.get<ApiResponse<TenderDiffResponse>>(
      `/tenders/admin/${id}/diff`,
      {
        params: { v1, v2 },
      },
    );
  },

  updateBasicInfo(id: string, data: Partial<UpdateTenderDto>) {
    return apiClient.patch<ApiResponse<Tender>>(
      `/tenders/admin/${id}/basic-info`,
      data,
    );
  },

  updateLocation(id: string, data: Partial<UpdateTenderDto>) {
    return apiClient.patch<ApiResponse<Tender>>(
      `/tenders/admin/${id}/location`,
      data,
    );
  },

  updateCommercial(id: string, data: Partial<UpdateTenderDto>) {
    return apiClient.patch<ApiResponse<Tender>>(
      `/tenders/admin/${id}/commercial`,
      data,
    );
  },

  updateSchedule(id: string, data: Partial<UpdateTenderDto>) {
    return apiClient.patch<ApiResponse<Tender>>(
      `/tenders/admin/${id}/schedule`,
      data,
    );
  },

  getCompletionStatus(id: string) {
    return apiClient.get<
      ApiResponse<{
        percentage: number;
        completedSteps: Record<string, boolean>;
      }>
    >(`/tenders/admin/${id}/completion`);
  },

  getReportPerformance() {
    return apiClient.get<ApiResponse<TenderReport>>(
      "/tenders/admin/reports/performance",
    );
  },
};
