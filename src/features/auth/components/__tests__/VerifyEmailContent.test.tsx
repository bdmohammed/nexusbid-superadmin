import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VerifyEmailContent } from '../VerifyEmailContent';

import * as authHook from '@/features/auth/hooks/useAuth';

let currentToken: string | null = 'sample-verify-token';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? currentToken : null),
  }),
}));

describe('VerifyEmailContent Component', () => {
  const mockVerifyEmail = vi.fn();
  const mockResendVerification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    currentToken = 'sample-verify-token';
    mockVerifyEmail.mockResolvedValue({});
    mockResendVerification.mockResolvedValue({});
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
      resetPassword: vi.fn(),
      verifyEmail: mockVerifyEmail,
      resendVerification: mockResendVerification,
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

  it('renders success state when token verification succeeds', async () => {
    mockVerifyEmail.mockResolvedValueOnce({});
    render(<VerifyEmailContent />);

    expect(screen.getByText(/Verifying your email address.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Email Verified Successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Redirecting to the login page.../i)).toBeInTheDocument();
    });
  });

  it('renders error state and resend form when token is absent or invalid', async () => {
    currentToken = null;
    render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(screen.getByText(/No verification token provided/i)).toBeInTheDocument();
      expect(screen.getByText(/Need a new verification link\?/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const resendBtn = screen.getByRole('button', { name: /Request New Link/i });

    fireEvent.change(emailInput, { target: { value: 'admin@rfpnexa.com' } });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockResendVerification).toHaveBeenCalledWith('admin@rfpnexa.com');
      expect(screen.getByText(/Verification link sent successfully!/i)).toBeInTheDocument();
    });
  });
});
