import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ForgotPasswordPage, { metadata } from '../page';

vi.mock('@/features/auth/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => (
    <div data-testid="mock-forgot-password-form">Mocked Forgot Password Form</div>
  ),
}));

describe('ForgotPasswordPage (app/forgot-password)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Forgot Password | RFPNexa Procurement Admin');
    expect(metadata.description).toBe('Reset your administrator account password.');
  });

  it('renders AuthCard title, description, and forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email and we'll send you a reset link."),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-forgot-password-form')).toBeInTheDocument();
  });
});
