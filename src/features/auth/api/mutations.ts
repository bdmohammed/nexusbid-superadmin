import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "./api";
import { authQueryKeys } from "./keys";

import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  DisableTotpInput,
  EmailChangeInput,
  OAuthCallbackInput,
  VerifyEmailChangeInput,
  UpdateUserDetailInput,
  SubmitApprovalInput,
  ReviewApprovalInput,
  ImpersonateUserInput,
  AssignUserRolesInput,
  CreateAdminInput,
  SetupInput,
} from "../types";
import { AppError, ErrorCode } from "@/lib/errors";

/**
 * Login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),

    onSuccess: async (response) => {
      queryClient.setQueryData(["auth", "me"], response.data);

      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me(),
      });

      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });
    },
  });
}

/**
 * Register
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me(),
      });
    },
  });
}

/**
 * Logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: async () => {
      // queryClient.removeQueries({
      //     queryKey: authQueryKeys.all,
      // });

      // queryClient.setQueryData(['auth', 'me'], null);
      // queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      queryClient.clear();
    },
  });
}

/**
 * Forgot Password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => authApi.forgotPassword(dto),
  });
}

/**
 * Reset Password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => authApi.resetPassword(dto),
  });
}

/**
 * Verify Email
 */
export function useVerifyEmail() {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),

    // onSuccess: async () => {
    //     await queryClient.invalidateQueries({
    //         queryKey: authQueryKeys.me(),
    //     });

    //     await queryClient.invalidateQueries({
    //         queryKey: authQueryKeys.session(),
    //     });
    // },
  });
}

/**
 * Resend Verification Email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}

/**
 * Revoke Session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.sessions(),
      });
    },
  });
}

/**
 * Revoke All Sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.revokeAllSessions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.sessions(),
      });
    },
  });
}

/**
 * Request Email Change
 */
export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (dto: EmailChangeInput) =>
      authApi.requestEmailChange(dto.email),
  });
}

/**
 * Verify Email Change
 */
export function useVerifyEmailChange() {
  return useMutation({
    mutationFn: (dto: VerifyEmailChangeInput) =>
      authApi.verifyEmailChange(dto.token),
  });
}

/**
 * Setup TOTP MFA
 */
export function useSetupTotp() {
  return useMutation({
    mutationFn: () => authApi.setupTotp(),
  });
}

/**
 * Disable TOTP MFA
 */
export function useDisableTotp() {
  return useMutation({
    mutationFn: (dto: DisableTotpInput) => authApi.disableTotp(dto),
  });
}

/**
 * Handle OAuth Callback
 */
export function useOAuthCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      provider,
      query,
    }: {
      provider: string;
      query: OAuthCallbackInput;
    }) => authApi.oauthCallback(provider, query),
    onSuccess: async (response) => {
      queryClient.setQueryData(["auth", "me"], response.data);

      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me(),
      });

      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });
    },
  });
}

/**
 * Block/unblock user
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isBlocked,
    }: {
      id: string;
      isBlocked: boolean;
    }) => {
      const { data } = await authApi.blockUser(id, { isBlocked });
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userOverview(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Create administrator account
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdminInput) => {
      const { data } = await authApi.createAdmin(input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Add internal warning note on user
 */
export function useCreateUserNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data } = await authApi.createUserNote(id, { note });
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userNotes(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userTimeline(variables.id),
      });
    },
  });
}

/**
 * Update user details
 */
export function useUpdateUserDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateUserDetailInput;
    }) => {
      const { data } = await authApi.updateUserDetail(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(variables.id),
      });
    },
  });
}

/**
 * Suspend user account
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.suspendUser(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userOverview(id),
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Activate user account
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.activateUser(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userOverview(id),
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Archive user account
 */
export function useArchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.archiveUser(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(id),
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Unarchive user account
 */
export function useUnarchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.unarchiveUser(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(id),
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.userStats() });
    },
  });
}

/**
 * Terminate user login session
 */
export function useRevokeUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sessionId,
    }: {
      id: string;
      sessionId: string;
    }) => {
      const { data } = await authApi.revokeUserSession(id, sessionId);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userSessions(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDevices(variables.id),
      });
    },
  });
}

/**
 * Terminate all active user sessions
 */
export function useRevokeAllUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.revokeAllUserSessions(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userSessions(id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDevices(id),
      });
    },
  });
}

/**
 * Force password reset on user next login
 */
export function useForcePasswordReset() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.forcePasswordReset(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Reset user password admin action
 */
export function useResetPasswordAdmin() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.resetPasswordAdmin(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Resend verification email to user
 */
export function useSendUserVerification() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authApi.sendUserVerification(id);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Submit user for approval
 */
export function useSubmitApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: SubmitApprovalInput;
    }) => {
      const { data } = await authApi.submitApproval(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["approval-request", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(variables.id),
      });
    },
  });
}

/**
 * Review/process pending user approval request
 */
export function useReviewApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: ReviewApprovalInput;
    }) => {
      const { data } = await authApi.reviewApproval(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["approval-request", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userDetails(variables.id),
      });
    },
  });
}

/**
 * Impersonate user session
 */
export function useImpersonateUser() {
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: ImpersonateUserInput;
    }) => {
      const { data } = await authApi.impersonateUser(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
  });
}

/**
 * Assign roles to user
 */
export function useAssignUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: AssignUserRolesInput;
    }) => {
      const { data } = await authApi.assignUserRoles(id, input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userRoles(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userPermissions(variables.id),
      });
    },
  });
}

/**
 * Revoke role assignment from user
 */
export function useRevokeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      const { data } = await authApi.revokeUserRole(id, roleId);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userRoles(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.userPermissions(variables.id),
      });
    },
  });
}

/**
 * Run first-time system setup wizard
 */
export function useRunSetupWizard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetupInput) => {
      const { data } = await authApi.runSetupWizard(input);
      if (!data.success) {
        throw new AppError(data.message, 400, data.error as ErrorCode);
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.setupAllowed() });
    },
  });
}
