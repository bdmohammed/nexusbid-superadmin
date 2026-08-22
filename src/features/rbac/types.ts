export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "DISABLED" | "ARCHIVED";
  versionStatus?:
    | "DRAFT"
    | "IN_REVIEW"
    | "PENDING_REVIEW"
    | "CHANGES_REQUESTED"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED";
  isSystemRole: boolean;
  isDefaultRole?: boolean;
  activeVersionId?: string | null;
  version?: number;
  versionNumber?: string;
  publishedVersionNumber?: string | null;
  latestDraftVersionNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  userCount: number;
  permissions: string[]; // Simplified resolved list of permission keys
  permissionKeys?: string[];
}

export interface RoleActivity {
  id: string;
  roleId: string;
  roleVersionId?: string | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  activityType:
    | "ROLE_CREATED"
    | "ROLE_UPDATED"
    | "PERMISSION_ADDED"
    | "PERMISSION_REMOVED"
    | "REVIEW_ASSIGNED"
    | "COMMENT_ADDED"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED"
    | "ARCHIVED"
    | "RESTORED";
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  createdAt: string;
}

export interface RoleComment {
  id: string;
  reviewId: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: "SUBMIT" | "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "COMMENT";
  comment: string;
  isInternal?: boolean;
  editedAt?: string | null;
  parentCommentId?: string | null;
  createdAt: string;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  status?: string;
  reviewerId?: string | null;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  reason?: string | null;
  comment?: string | null;
  effectiveAt?: string | null;
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  expiresAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    accountType?: string;
    emailVerified?: boolean;
    isVerified?: boolean;
    status?: string;
  };
  role?: Role;
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  moduleId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface CreateAssignmentDto {
  userId: string;
  roleId: string;
  effectiveAt?: string | null;
  expiresAt?: string | null;
  reason?: string;
  comment?: string;
  reviewerId?: string;
  status?: "DRAFT" | "SUBMITTED" | "APPROVED";
}
