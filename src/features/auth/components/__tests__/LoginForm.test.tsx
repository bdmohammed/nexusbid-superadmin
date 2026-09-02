import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from '../LoginForm';

import * as authHook from '@/features/auth/hooks/useAuth';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirect' ? '/dashboard' : null),
  }),
}));

describe('LoginForm Component', () => {
  const mockLogin = vi.fn();

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
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      forgotPassword: vi.fn(),
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

  it('renders email, password inputs, submit button, and forgot password link', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Log In$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot Password\?/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('toggles password visibility when toggle button is clicked', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText<HTMLInputElement>(/^Password$/i);
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByLabelText<HTMLButtonElement>(/Show password/i);
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();
  });

  it('validates invalid email format on touch', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText<HTMLInputElement>(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls login mutation on valid submission', async () => {
    mockLogin.mockResolvedValueOnce({ user: { id: '1', email: 'admin@rfpnexa.com' } });
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /^Log In$/i });

    fireEvent.change(emailInput, { target: { value: 'admin@rfpnexa.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@rfpnexa.com',
        password: 'Password123!',
      });
    });
  });
});
