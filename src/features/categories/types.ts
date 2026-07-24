export interface CategoryQuery {
    search?: string;
    code?: string;
    slug?: string;
    status?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    unusedOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface CategoryHistoryItem {
    id: string;
    categoryId: string;
    action: string;
    changedBy: string;
    changes: any;
    createdAt: string;
}

export interface CategoryGovernance {
    id: string;
    categoryId: string;
    status: string;
    currentReviewerId?: string | null;
    reviewerIds?: string[];
    comments?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryStats {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    tendersCount: number;
}

export interface CreateCategoryInput {
    code?: string;
    name: string;
    slug?: string;
    description?: string | null;
    parentCategoryId?: string | null;
    displayOrder?: number;
    icon?: string | null;
    color?: string | null;
    isActive?: boolean;
}

export interface UpdateCategoryInput {
    code?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    parentCategoryId?: string | null;
    displayOrder?: number;
    icon?: string | null;
    color?: string | null;
    isActive?: boolean;
}

export interface BatchCategoryItem {
    action?: 'upsert' | 'delete';
    code?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    isActive?: boolean;
}

export interface BatchCategoriesResult {
    created: number;
    updated: number;
    deleted: number;
    failed: number;
}

export interface SubmitCategoryReviewInput {
    comment?: string;
    reviewerIds?: string[];
}

export interface CategoryDecisionInput {
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
    comment?: string;
    reason?: string;
}