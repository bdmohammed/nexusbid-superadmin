import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ResetPasswordPage, { metadata } from '../page';

vi.mock('@/features/auth/components/ResetPasswordForm', () => ({
  ResetPasswordForm: () => (
    <div data-testid="mock-reset-password-form">Mocked Reset Password Form</div>
  ),
}));

describe('ResetPasswordPage (app/reset-password)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Reset Password | RFPNexa Procurement Admin');
    expect(metadata.description).toBe('Set a new secure password for your administrator account.');
  });

  it('renders AuthCard title, description, and reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText('New Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    expect(screen.getByTestId('mock-reset-password-form')).toBeInTheDocument();
  });
});
