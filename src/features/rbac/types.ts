export interface Role {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
    isSystemRole: boolean;
    isDefaultRole?: boolean;
    activeVersionId?: string | null;
    version?: number;
    createdAt: string;
    permissions?: string[]; // Simplified resolved list of permission keys
}

export interface UserRoleAssignment {
    id: string;
    userId: string;
    roleId: string;
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
    expiresAt: string | null;
}
