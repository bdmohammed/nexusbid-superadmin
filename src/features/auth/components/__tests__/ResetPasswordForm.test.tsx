import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResetPasswordForm } from '../ResetPasswordForm';

import * as authHook from '@/features/auth/hooks/useAuth';

let currentToken: string | null = 'sample-valid-token';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? currentToken : null),
  }),
}));

describe('ResetPasswordForm Component', () => {
  const mockResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    currentToken = 'sample-valid-token';
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: mockResetPassword,
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      isLoggingIn: false,
      isRegistering: false,
      isLoggingOut: false,
      isForgotSending: false,
      isResetting: false,
      isVerifying: false,
      isResendingVerification: false,
      loginError: null,
      registerError: null,
      logoutError: null,
      forgotPasswordError: null,
      resetPasswordError: null,
      verifyEmailError: null,
      resendVerificationError: null,
      setAuthenticated: vi.fn(),
    });
  });

  it('renders missing token notice when token is absent', () => {
    currentToken = null;
    render(<ResetPasswordForm />);

    expect(
      screen.getByText(/Missing reset token. Please click the link in your email again./i),
    ).toBeInTheDocument();
  });

  it('renders password fields and submits with valid matching passwords', async () => {
    mockResetPassword.mockResolvedValueOnce({});
    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByRole('button', { name: /Save Password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'SuperSecret123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'SuperSecret123!' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'sample-valid-token',
        password: 'SuperSecret123!',
      });
    });
  });
});
