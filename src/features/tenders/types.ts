import { Tender } from "@/types";

export interface TenderQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    stateId?: string;
    minPriceCents?: number;
    maxPriceCents?: number;
    submissionType?: 'digital' | 'physical' | 'both';
}

export interface TenderDetailsResponse {
    tender: Tender;
    hasAccess: boolean;
}

export interface TenderDownloadResponse {
    downloadUrl: string;
}

export interface TenderSearchQueryDto {
    q?: string;
    categoryId?: string;
    stateId?: number;
    status?: string;
    publicationStatus?: string;
    priority?: string;
    procurementType?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
    sort?: 'createdAt' | 'closingDate' | 'estimatedBudget';
    order?: 'ASC' | 'DESC';
}

export interface CreateTenderDto {
    title: string;
    description: string;
    procurementType?: string;
    priority?: string;
    estimatedBudget?: number;
    currency?: string;
    department?: string;
    placeId?: string;
    formattedAddress?: string;
    siteVisitRequired?: boolean;
    siteVisitDate?: string | null;
    siteVisitInstructions?: string;
    contactPerson?: string;
    contactDesignation?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAlternative?: string;
    openingDate?: string | null;
    closingDate?: string | null;
    bidValidity?: number;
    projectDuration?: string;
    emdAmount?: number;
    securityDeposit?: number;
    paymentTerms?: string;
    visibility?: string;
    evaluationMethod?: string;
    submissionMethod?: string;
    contractType?: string;
    procurementMethod?: string;
    eligibilityCriteria?: string;
    specialConditions?: string;
    categoryId?: string | null;
    stateId?: number | null;
    templateId?: string;
}

export interface UpdateTenderDto extends Partial<CreateTenderDto> {
    dbVersion?: number;
}

export interface UpdateTenderStatusDto {
    status?: string;
    publicationStatus?: string;
    rejectionNote?: string;
}

export interface UploadUrlDto {
    fileName: string;
    documentType?: string;
}

export interface UploadUrlResponse {
    uploadUrl: string;
    key: string;
}

export interface RegisterDocumentDto {
    documentType: string;
    s3Key: string;
    bucket: string;
    originalName: string;
    mimeType?: string;
    fileSize?: number;
    checksum?: string;
    isPublic?: boolean;
}

export interface CreateQuestionDto {
    questionText: string;
}

export interface AnswerQuestionDto {
    answerText: string;
    isPublic?: boolean;
}

export interface CreateClarificationDto {
    title: string;
    description: string;
}

export interface CreateAmendmentDto {
    amendmentNumber: number;
    changedFields: any;
}

export interface AssignReviewerDto {
    reviewerIds: string[];
}

export interface SubmitReviewCommentDto {
    commentText: string;
    status?: string;
}

export interface TenderCommitteeDto {
    userId: string;
    role: 'Chairperson' | 'Evaluator' | 'Observer';
}

export interface SubmitEvaluationDto {
    evaluationType: 'technical' | 'financial' | 'overall';
    criteriaName: string;
    weight: number;
    score: number;
    maxScore: number;
    passed?: boolean;
    remarks?: string;
}

export interface TenderWatcherDto {
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    notifySms?: boolean;
}

export interface TenderInvitationDto {
    email: string;
    expiresDays?: number;
}

export interface TenderTemplateDto {
    templateScope: 'department' | 'organization' | 'personal';
    departmentId?: string;
    title: string;
    description?: string;
    payload: any;
}

export interface TenderHistoryLog {
    id: string;
    tenderId: string;
    action: string;
    performedBy: string;
    details?: any;
    createdAt: string;
}

export interface TenderDiffResponse {
    changes: Record<string, { old: any; new: any }>;
}

export interface TenderReport {
    summary: string;
    data: any[];
}