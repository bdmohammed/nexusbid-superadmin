import type { User } from '@/types/user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  companyName: string;
  countryId: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password?: string; // backend dto has password or newPassword?
}

export interface AuthResponse {
  user: User;
}

export interface CsrfTokenResponse {
  csrfToken: string;
}

export interface EmailChangeInput {
  email: string;
}

export interface VerifyEmailChangeInput {
  token: string;
}

export interface UserSession {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  browserName: string;
  lastUsedAt: string;
}

export interface TotpSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface DisableTotpInput {
  code: string;
}

export interface OAuthCallbackInput {
  code: string;
  state: string;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  country?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  requestId?: string;
}

export interface UpdateUserDetailInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  countryId?: string | null;
}

export interface SubmitApprovalInput {
  reviewerId: string;
  notes: string;
}

export interface ReviewApprovalInput {
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

export interface ImpersonateUserInput {
  reason: string;
}

export interface AssignUserRolesInput {
  assignments: {
    roleId: string;
    expiresAt?: string | null;
  }[];
}

export interface CreateAdminInput {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SetupInput {
  name: string;
  email: string;
  password?: string;
}

export interface UserStats {
  totalUsers: number;
  admins: number;
  pendingApprovals: number;
  blockedUsers: number;
}

export interface UserNote {
  id: string;
  userId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId: string;
  notes?: string | null;
  reason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}
