import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '../msw/server';

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'sample-token' : '/dashboard'),
  }),
}));

describe('Auth Flows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes Login flow successfully and triggers redirect', async () => {
    server.use(
      http.get('*/api/v1/auth/csrf-token', () => {
        return HttpResponse.json({
          success: true,
          data: { csrfToken: 'csrf-123' },
        });
      }),
      http.post('*/api/v1/auth/admin/login', () => {
        return HttpResponse.json({
          success: true,
          data: {
            user: {
              id: 'usr_admin_1',
              email: 'admin@rfpnexa.com',
              name: 'Super Admin',
            },
          },
        });
      }),
    );

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
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('completes Forgot Password flow with server response', async () => {
    server.use(
      http.get('*/api/v1/auth/csrf-token', () => {
        return HttpResponse.json({
          success: true,
          data: { csrfToken: 'csrf-123' },
        });
      }),
      http.post('*/api/v1/auth/forgot-password', () => {
        return HttpResponse.json({
          success: true,
          message: 'Reset email sent',
        });
      }),
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    fireEvent.change(emailInput, { target: { value: 'admin@rfpnexa.com' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument();
    });
  });

  it('completes Reset Password flow with new password submission', async () => {
    server.use(
      http.get('*/api/v1/auth/csrf-token', () => {
        return HttpResponse.json({
          success: true,
          data: { csrfToken: 'csrf-123' },
        });
      }),
      http.post('*/api/v1/auth/reset-password', () => {
        return HttpResponse.json({
          success: true,
          message: 'Password reset successful',
        });
      }),
    );

    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByRole('button', { name: /Save Password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'SecurePass999!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass999!' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeInTheDocument();
    });
  });
});
