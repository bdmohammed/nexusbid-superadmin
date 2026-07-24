import { Category } from "./category";
import { State } from "./state";

export type TenderLifecycleStatus = 'ACTIVE' | 'ARCHIVED' | 'CANCELLED';
export type TenderVersionStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEW_ASSIGNED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'ARCHIVED_VERSION';
export type TenderPublicationStatus = 'UNPUBLISHED' | 'SCHEDULED' | 'PUBLISHED' | 'RETRACTED';
export type TenderBiddingStatus = 'NOT_OPEN' | 'OPEN' | 'CLOSED';
export type TenderProcessStatus = 'PRE_BIDDING' | 'IN_BIDDING' | 'UNDER_EVALUATION' | 'AWARDED' | 'COMPLETED' | 'FAILED';

export interface Tender {
  id: string;
  referenceNo: string;
  activeVersionId: string | null;
  status: TenderLifecycleStatus;
  publicationStatus: TenderPublicationStatus;
  biddingStatus?: TenderBiddingStatus;
  processStatus?: TenderProcessStatus;
  publishAt?: string | null;
  createdAt: string;
  updatedAt: string;
  activeVersion?: TenderVersion | null;
}

export interface TenderVersion {
  id: string;
  tenderId: string;
  version: number;
  status: TenderVersionStatus;
  title: string;
  description: string;
  procurementType: string | null;
  priority: string;
  estimatedBudget: number | null;
  currency: string;
  department: string | null;
  placeId: string | null;
  formattedAddress: string | null;
  siteVisitRequired: boolean;
  siteVisitDate: string | null;
  siteVisitInstructions: string | null;
  contactPerson: string | null;
  contactDesignation: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAlternative: string | null;
  openingDate: string | null;
  closingDate: string | null;
  bidValidity: number | null;
  projectDuration: string | null;
  emdAmount: number | null;
  securityDeposit: number | null;
  paymentTerms: string | null;
  visibility: string;
  evaluationMethod: string | null;
  submissionMethod: string | null;
  contractType: string | null;
  procurementMethod: string | null;
  eligibilityCriteria: string | null;
  specialConditions: string | null;
  categoryId: string | null;
  stateId: string | null;
  category?: Category | null;
  state?: State | null;
  createdAt: string;
  documents?: TenderDocument[];
}

export interface TenderDocument {
  id: string;
  tenderVersionId: string;
  documentType: string;
  s3Key: string;
  bucket: string;
  originalName: string;
  mimeType: string | null;
  fileSize: number | null;
  version: number;
  checksum: string | null;
  virusScanStatus: 'Pending' | 'Scanning' | 'Clean' | 'Infected' | 'Rejected';
  isPublic: boolean;
  downloadCount: number;
  uploadedAt: string;
}

export interface TenderParticipant {
  id: string;
  tenderId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  status: 'invited' | 'registered' | 'submitted' | 'qualified' | 'rejected' | 'awarded' | 'disqualified' | 'withdrawn';
  submissionVersion: number | null;
  withdrawnAt: string | null;
  evaluationCompleted: boolean;
}

export interface TenderEvaluation {
  id: string;
  participantId: string;
  evaluationType: 'technical' | 'financial' | 'overall';
  criteriaName: string;
  weight: number;
  score: number;
  maxScore: number;
  passed: boolean;
  remarks: string | null;
}

export interface TenderCommittee {
  id: string;
  tenderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'Chairperson' | 'Evaluator' | 'Observer';
}

export interface TenderQuestion {
  id: string;
  tenderId: string;
  vendorId: string;
  vendorName: string;
  questionText: string;
  answerText: string | null;
  isPublic: boolean;
  answeredAt: string | null;
  createdAt: string;
}

export interface TenderClarification {
  id: string;
  tenderId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface TenderAmendment {
  id: string;
  tenderId: string;
  amendmentNumber: number;
  changedFields: any;
  createdAt: string;
}

export interface TenderReview {
  id: string;
  tenderVersionId: string;
  status: string;
  createdAt: string;
  assignments: TenderReviewAssignment[];
  comments: TenderReviewComment[];
}

export interface TenderReviewAssignment {
  id: string;
  reviewId: string;
  reviewerId: string;
  reviewerName: string;
  assignedAt: string;
  completedAt: string | null;
}

export interface TenderReviewComment {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  commentText: string;
  createdAt: string;
}