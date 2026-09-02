import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import VerifyEmailPage, { metadata } from '../page';

vi.mock('@/features/auth/components/VerifyEmailContent', () => ({
  VerifyEmailContent: () => (
    <div data-testid="mock-verify-email-content">Mocked Verify Email Content</div>
  ),
}));

describe('VerifyEmailPage (app/verify-email)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Verify Email | RFPNexa Procurement Admin');
    expect(metadata.description).toBe('Verify your administrator email address.');
  });

  it('renders AuthCard title and verify email content', () => {
    render(<VerifyEmailPage />);

    expect(screen.getByText('Email Verification')).toBeInTheDocument();
    expect(screen.getByTestId('mock-verify-email-content')).toBeInTheDocument();
  });
});
