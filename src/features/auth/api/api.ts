import type {
  ApprovalRequest,
  AssignUserRolesInput,
  AuthResponse,
  CreateAdminInput,
  CsrfTokenResponse,
  DisableTotpInput,
  ForgotPasswordDto,
  ImpersonateUserInput,
  ListUsersQuery,
  LoginDto,
  OAuthCallbackInput,
  RegisterDto,
  ResetPasswordDto,
  ReviewApprovalInput,
  SetupInput,
  SubmitApprovalInput,
  TotpSetupResponse,
  UpdateUserDetailInput,
  UserDevice,
  UserNote,
  UserSession,
  UserStats,
} from '../types';
import type { ApiResponse, User } from '@/types';
import { apiClient } from '@/lib/http';

export const authApi = {
  /**
   * Login
   */
  login(dto: LoginDto) {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/admin/login', dto);
  },

  /**
   * Register
   */
  register(payload: RegisterDto) {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/admin/register', payload);
  },

  /**
   * Logout
   */
  logout() {
    return apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  /**
   * Current User
   */
  me() {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },

  /**
   * Forgot Password
   */
  forgotPassword(dto: ForgotPasswordDto) {
    return apiClient.post<ApiResponse<void>>('/auth/forgot-password', dto);
  },

  /**
   * Reset Password
   */
  resetPassword(dto: ResetPasswordDto) {
    return apiClient.post<ApiResponse<void>>('/auth/reset-password', dto);
  },

  /**
   * Verify Email
   */
  verifyEmail(token: string) {
    return apiClient.post<void>('/auth/admin/verify-email', {
      token,
    });
  },

  /**
   * Resend Verification Email
   */
  resendVerification(email: string) {
    return apiClient.post<ApiResponse<void>>('/auth/resend-verification', {
      email,
    });
  },

  /**
   * Verify Bootstrap Token
   */
  bootstrapVerify(token: string) {
    return apiClient.get<ApiResponse<{ name: string; email: string }>>('/auth/admin/bootstrap', {
      params: { token },
    });
  },

  /**
   * Approve Bootstrap Admin
   */
  bootstrapApprove(token: string, action: 'approve' | 'reject' = 'approve') {
    return apiClient.post<ApiResponse<void>>('/auth/admin/bootstrap', {
      token,
      action,
    });
  },

  /**
   * CSRF Token
   */
  getCsrfToken() {
    return apiClient.get<ApiResponse<CsrfTokenResponse>>('/auth/csrf-token');
  },

  /**
   * Refresh Token Session
   */
  refresh() {
    return apiClient.post<ApiResponse<any>>('/auth/refresh');
  },

  /**
   * Get active sessions
   */
  getSessions() {
    return apiClient.get<ApiResponse<UserSession[]>>('/auth/sessions');
  },

  /**
   * Revoke single session
   */
  revokeSession(sessionId: string) {
    return apiClient.delete<ApiResponse<any>>(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all user sessions
   */
  revokeAllSessions() {
    return apiClient.delete<ApiResponse<any>>('/auth/sessions');
  },

  /**
   * Verify email change verification code
   */
  verifyEmailChange(token: string) {
    return apiClient.post<ApiResponse<any>>('/auth/email/change/verify', {
      token,
    });
  },

  /**
   * Propose email change request
   */
  requestEmailChange(email: string) {
    return apiClient.post<ApiResponse<any>>('/auth/email/change/request', {
      email,
    });
  },

  /**
   * List user login devices
   */
  getDevices() {
    return apiClient.get<ApiResponse<UserDevice[]>>('/auth/devices');
  },

  /**
   * Generate TOTP secret and QR URL
   */
  setupTotp() {
    return apiClient.post<ApiResponse<TotpSetupResponse>>('/auth/mfa/totp/setup');
  },

  /**
   * Disable TOTP MFA
   */
  disableTotp(input: DisableTotpInput) {
    return apiClient.delete<ApiResponse<any>>('/auth/mfa/totp/disable', {
      data: input,
    });
  },

  /**
   * Redirect to OAuth provider
   */
  oauthRedirect(provider: string) {
    return apiClient.get<any>(`/auth/oauth/${provider}`);
  },

  /**
   * Handle OAuth provider code exchange callback
   */
  oauthCallback(provider: string, query: OAuthCallbackInput) {
    return apiClient.get<ApiResponse<AuthResponse>>(`/auth/oauth/${provider}/callback`, {
      params: query,
    });
  },

  /**
   * Owner Review admin registrations
   */
  ownerReview(query: { token: string }) {
    return apiClient.get<ApiResponse<any[]>>('/auth/admin/owner-review', {
      params: query,
    });
  },

  /**
   * List system users with pagination/filtering
   */
  listUsers(query?: ListUsersQuery) {
    return apiClient.get<ApiResponse<User[]>>('/admin/users', {
      params: query,
    });
  },

  /**
   * Get user administrative statistics
   */
  getUserStats() {
    return apiClient.get<ApiResponse<UserStats>>('/admin/users/stats');
  },

  /**
   * Get single user full details
   */
  getUserDetails(id: string) {
    return apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  },

  /**
   * Block/unblock user
   */
  blockUser(id: string, input: { isBlocked: boolean }) {
    return apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/block`, input);
  },

  /**
   * Create administrator account directly
   */
  createAdmin(input: CreateAdminInput) {
    return apiClient.post<ApiResponse<User>>('/admin/users/admin', input);
  },

  /**
   * Get user profile/activity overview
   */
  getUserOverview(id: string) {
    return apiClient.get<ApiResponse<any>>(`/admin/users/${id}/overview`);
  },

  /**
   * Get user security change history log
   */
  getUserSecurityLog(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/admin/users/${id}/security`);
  },

  /**
   * Get active login sessions of user
   */
  getUserSessions(id: string) {
    return apiClient.get<ApiResponse<UserSession[]>>(`/admin/users/${id}/sessions`);
  },

  /**
   * Get login devices of user
   */
  getUserDevices(id: string) {
    return apiClient.get<ApiResponse<UserDevice[]>>(`/admin/users/${id}/devices`);
  },

  /**
   * Get user general action activity feed
   */
  getUserActivity(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/admin/users/${id}/activity`);
  },

  /**
   * Get user operational lifecycle timeline
   */
  getUserTimeline(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/admin/users/${id}/timeline`);
  },

  /**
   * Get user audit logs
   */
  getUserAuditLog(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/admin/users/${id}/audit`);
  },

  /**
   * Get user active subscription profile details
   */
  getUserSubscription(id: string) {
    return apiClient.get<ApiResponse<any>>(`/admin/users/${id}/subscription`);
  },

  /**
   * Get internal warnings/notes recorded on user
   */
  getUserNotes(id: string) {
    return apiClient.get<ApiResponse<UserNote[]>>(`/admin/users/${id}/notes`);
  },

  /**
   * Create/append internal warning note to user profile
   */
  createUserNote(id: string, input: { note: string }) {
    return apiClient.post<ApiResponse<UserNote>>(`/admin/users/${id}/notes`, input);
  },

  /**
   * Update user details directly
   */
  updateUserDetail(id: string, input: UpdateUserDetailInput) {
    return apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/details`, input);
  },

  /**
   * Suspend user account
   */
  suspendUser(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/suspend`);
  },

  /**
   * Activate user account
   */
  activateUser(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/activate`);
  },

  /**
   * Archive user account
   */
  archiveUser(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/archive`);
  },

  /**
   * Unarchive user account
   */
  unarchiveUser(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/unarchive`);
  },

  /**
   * Terminate user session
   */
  revokeUserSession(id: string, sessionId: string) {
    return apiClient.delete<ApiResponse<any>>(`/admin/users/${id}/sessions/${sessionId}`);
  },

  /**
   * Terminate all active user sessions
   */
  revokeAllUserSessions(id: string) {
    return apiClient.delete<ApiResponse<any>>(`/admin/users/${id}/sessions`);
  },

  /**
   * Force user to reset password on next login
   */
  forcePasswordReset(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/force-password-reset`);
  },

  /**
   * Reset user password
   */
  resetPasswordAdmin(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/reset-password`);
  },

  /**
   * Resend verification email to user
   */
  sendUserVerification(id: string) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/send-verification`);
  },

  /**
   * Submit user for review/approval
   */
  submitApproval(id: string, input: SubmitApprovalInput) {
    return apiClient.post<ApiResponse<ApprovalRequest>>(
      `/admin/users/${id}/submit-approval`,
      input,
    );
  },

  /**
   * Process/review pending user approval request
   */
  reviewApproval(id: string, input: ReviewApprovalInput) {
    return apiClient.post<ApiResponse<ApprovalRequest>>(
      `/admin/users/${id}/review-approval`,
      input,
    );
  },

  /**
   * Get pending approval request details
   */
  getApprovalRequest(id: string) {
    return apiClient.get<ApiResponse<ApprovalRequest>>(`/admin/users/${id}/approval-request`);
  },

  /**
   * Impersonate user session
   */
  impersonateUser(id: string, input: ImpersonateUserInput) {
    return apiClient.post<ApiResponse<any>>(`/admin/users/${id}/impersonate`, input);
  },

  /**
   * Get assigned roles of user
   */
  getUserRoles(id: string) {
    return apiClient.get<ApiResponse<any[]>>(`/admin/users/${id}/roles`);
  },

  /**
   * Assign roles to user
   */
  assignUserRoles(id: string, input: AssignUserRolesInput) {
    return apiClient.put<ApiResponse<any>>(`/admin/users/${id}/roles`, input);
  },

  /**
   * Revoke role assignment from user
   */
  revokeUserRole(id: string, roleId: string) {
    return apiClient.delete<ApiResponse<any>>(`/admin/users/${id}/roles/${roleId}`);
  },

  /**
   * Preview final compiled permissions of user
   */
  previewUserPermissions(id: string) {
    return apiClient.get<ApiResponse<string[]>>(`/admin/users/${id}/permissions`);
  },

  /**
   * Check setup wizard availability
   */
  checkSetupAllowed() {
    return apiClient.get<ApiResponse<{ setupAllowed: boolean }>>('/admin/register/check');
  },

  /**
   * Run first-time platform setup wizard
   */
  runSetupWizard(input: SetupInput) {
    return apiClient.post<ApiResponse<{ userId: string; email: string }>>('/admin/register', input);
  },
};
