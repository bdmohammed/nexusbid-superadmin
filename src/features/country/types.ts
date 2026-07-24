export interface StateQuery {
    search?: string;
    code?: string;
    slug?: string;
    type?: string;
    countryId?: number;
    countryCode?: string;
    page?: number;
    limit?: number;
}

export type CountryChangeRequestTargetType = 'COUNTRY' | 'STATE';
export type CountryChangeRequestAction = 'ACTIVATE' | 'DEACTIVATE';
export type CountryCommentType = 'GENERAL' | 'REVIEW' | 'SYSTEM';

export interface CascadePolicy {
    disableStates: boolean;
    disableTenders: boolean;
    disableCategories: boolean;
    hideFromSearch: boolean;
    notifySuppliers: boolean;
}

export interface CreateCountryChangeRequestInput {
    targetType: CountryChangeRequestTargetType;
    countryId: string;
    stateId?: string | null;
    action: CountryChangeRequestAction;
    reason: string;
    cascadePolicy?: CascadePolicy;
}

export interface AssignReviewerInput {
    reviewerId: string;
}

export interface AddCommentInput {
    type?: CountryCommentType;
    content: string;
}

export interface ReviewChangeRequestInput {
    action: 'APPROVE' | 'REJECT';
    comment?: string;
}

export interface ChangeRequestQueryInput {
    filter?: 'assigned' | 'pending' | 'approved' | 'rejected' | 'all';
    search?: string;
    page?: number;
    limit?: number;
}

export interface DependencyMatrixQueryInput {
    targetType: CountryChangeRequestTargetType;
    countryId: string;
    stateId?: string;
}

export interface CountryTimelineQueryInput {
    stateId?: string;
}

export interface UpdateStateBodyDto {
    isActive: boolean;
}

export interface UpdateCountryBodyDto {
    isActive: boolean;
}

export interface Reviewer {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    canBeAssigned: boolean;
}

export interface OperationalStats {
    totalCountries: number;
    activeCountries: number;
    disabledCountries: number;
    totalStates: number;
    activeStates: number;
    disabledStates: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
}

export interface DependencyMatrix {
    states: {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
    }[];
    tenders: {
        id: string;
        tenderNumber: string;
        title: string;
        status: string;
    }[];
    categoriesCount: number;
    suppliersCount: number;
}

export interface CommentItem {
    id: string;
    type: CountryCommentType;
    content: string;
    createdBy: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
    };
    createdAt: string;
}

export interface TicketItem {
    id: string;
    requestNumber: string;
    targetType: CountryChangeRequestTargetType;
    countryId: string;
    countryName: string;
    stateId?: string | null;
    stateName?: string | null;
    action: CountryChangeRequestAction;
    status: string;
    reason: string;
    cascadePolicy?: CascadePolicy | null;
    requestedBy: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
    };
    assignedReviewer?: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
    } | null;
    comments?: CommentItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CountryHierarchyNode {
    id: string;
    name: string;
    code: string;
    type: 'COUNTRY' | 'STATE';
    isActive: boolean;
    version: number;
    tenderCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        fullName: string;
    } | null;
    approvedBy?: {
        id: string;
        fullName: string;
    } | null;
    activeRequestId?: string | null;
    activeRequestNumber?: string | null;
    children?: CountryHierarchyNode[];
}

export interface ActivityItem {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    performedBy: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
    };
    createdAt: string;
}