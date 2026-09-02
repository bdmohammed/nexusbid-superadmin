import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ForgotPasswordForm } from '../ForgotPasswordForm';

import * as authHook from '@/features/auth/hooks/useAuth';

describe('ForgotPasswordForm Component', () => {
  const mockForgotPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
      forgotPassword: mockForgotPassword,
      resetPassword: vi.fn(),
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

  it('renders email input, submit button, and back to login link', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Login/i })).toHaveAttribute('href', '/login');
  });

  it('validates invalid email format', async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls forgotPassword and displays success state', async () => {
    mockForgotPassword.mockResolvedValueOnce({});
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    fireEvent.change(emailInput, { target: { value: 'admin@rfpnexa.com' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'admin@rfpnexa.com' });
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument();
      expect(screen.getByText('admin@rfpnexa.com')).toBeInTheDocument();
    });
  });
});
