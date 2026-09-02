import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../useAuth';

import type { User } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';
import * as mutations from '@/features/auth/api/mutations';
import * as queries from '@/features/auth/api/queries';
import * as store from '@/features/auth/store/store';
import { AccountType, UserStatus } from '@/types';

vi.mock('@/features/auth/api/mutations');
vi.mock('@/features/auth/api/queries');
vi.mock('@/features/auth/store/store');

const refetch = vi.fn();
const setAuthenticated = vi.fn();

function createQueryResult<T>(data: T): UseQueryResult<T, Error> {
  return {
    data,
    error: null,
    isLoading: false,
    isFetching: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    isLoadingError: false,
    isRefetchError: false,
    status: 'success',
    fetchStatus: 'idle',
    refetch,
  } as unknown as UseQueryResult<T, Error>;
}

function createMutationResult<T>() {
  return {
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    variables: undefined,
    status: 'idle',
  } as unknown as T;
}

const loginMutation = createMutationResult<ReturnType<typeof mutations.useLogin>>();

const registerMutation = createMutationResult<ReturnType<typeof mutations.useRegister>>();

const logoutMutation = createMutationResult<ReturnType<typeof mutations.useLogout>>();

const forgotPasswordMutation =
  createMutationResult<ReturnType<typeof mutations.useForgotPassword>>();

const resetPasswordMutation = createMutationResult<ReturnType<typeof mutations.useResetPassword>>();

const verifyEmailMutation = createMutationResult<ReturnType<typeof mutations.useVerifyEmail>>();

const resendVerificationMutation =
  createMutationResult<ReturnType<typeof mutations.useResendVerification>>();

const mockedUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@test.com',
  accountType: AccountType.ADMIN,
  companyName: null,
  country: 'usa',
  emailVerified: false,
  isBlocked: false,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  adminRole: 'super_admin',
  status: UserStatus.ACTIVE,
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(queries.useCurrentUser).mockReturnValue(createQueryResult<User>(mockedUser));

    vi.mocked(store.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      setAuthenticated,
    });

    vi.mocked(mutations.useLogin).mockReturnValue(loginMutation);
    vi.mocked(mutations.useRegister).mockReturnValue(registerMutation);
    vi.mocked(mutations.useLogout).mockReturnValue(logoutMutation);
    vi.mocked(mutations.useForgotPassword).mockReturnValue(forgotPasswordMutation);
    vi.mocked(mutations.useResetPassword).mockReturnValue(resetPasswordMutation);
    vi.mocked(mutations.useVerifyEmail).mockReturnValue(verifyEmailMutation);
    vi.mocked(mutations.useResendVerification).mockReturnValue(resendVerificationMutation);
  });

  it('returns current user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockedUser);
  });

  it('returns authentication state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isInitializing).toBe(false);
  });

  it('returns current user query state', () => {
    const { result } = renderHook(() => useAuth());
    console.log(result.current.refetch === refetch);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBe(refetch);
  });

  it('returns all mutation functions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBe(loginMutation.mutateAsync);
    expect(result.current.register).toBe(registerMutation.mutateAsync);
    expect(result.current.logout).toBe(logoutMutation.mutateAsync);
    expect(result.current.forgotPassword).toBe(forgotPasswordMutation.mutateAsync);
    expect(result.current.resetPassword).toBe(resetPasswordMutation.mutateAsync);
    expect(result.current.verifyEmail).toBe(verifyEmailMutation.mutateAsync);
    expect(result.current.resendVerification).toBe(resendVerificationMutation.mutateAsync);
  });

  it('returns all loading states', () => {
    loginMutation.isPending = true;
    registerMutation.isPending = true;
    logoutMutation.isPending = true;
    forgotPasswordMutation.isPending = true;
    resetPasswordMutation.isPending = true;
    verifyEmailMutation.isPending = true;
    resendVerificationMutation.isPending = true;

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggingIn).toBe(true);
    expect(result.current.isRegistering).toBe(true);
    expect(result.current.isLoggingOut).toBe(true);
    expect(result.current.isForgotSending).toBe(true);
    expect(result.current.isResetting).toBe(true);
    expect(result.current.isVerifying).toBe(true);
    expect(result.current.isResendingVerification).toBe(true);
  });

  it('returns all mutation errors', () => {
    const loginError = new Error('login');
    const registerError = new Error('register');
    const logoutError = new Error('logout');
    const forgotError = new Error('forgot');
    const resetError = new Error('reset');
    const verifyError = new Error('verify');
    const resendError = new Error('resend');

    loginMutation.error = loginError;
    registerMutation.error = registerError;
    logoutMutation.error = logoutError;
    forgotPasswordMutation.error = forgotError;
    resetPasswordMutation.error = resetError;
    verifyEmailMutation.error = verifyError;
    resendVerificationMutation.error = resendError;

    const { result } = renderHook(() => useAuth());

    expect(result.current.loginError).toBe(loginError);
    expect(result.current.registerError).toBe(registerError);
    expect(result.current.logoutError).toBe(logoutError);
    expect(result.current.forgotPasswordError).toBe(forgotError);
    expect(result.current.resetPasswordError).toBe(resetError);
    expect(result.current.verifyEmailError).toBe(verifyError);
    expect(result.current.resendVerificationError).toBe(resendError);
  });

  it('returns null user when query has no data', () => {
    vi.mocked(queries.useCurrentUser).mockReturnValue(
      createQueryResult<User>(undefined as unknown as User),
    );

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
  });

  it('returns setAuthenticated action', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.setAuthenticated).toBe(setAuthenticated);
  });

  it('memoizes the returned object when dependencies do not change', () => {
    const { result, rerender } = renderHook(() => useAuth());

    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('updates when authentication state changes', () => {
    const { result, rerender } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);

    vi.mocked(store.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
      setAuthenticated,
    });

    rerender();

    expect(result.current.isAuthenticated).toBe(false);
  });
});
