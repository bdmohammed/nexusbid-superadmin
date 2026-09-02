import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import RegisterPage, { metadata } from '../page';

vi.mock('@/features/auth/components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="mock-register-form">Mocked Register Form</div>,
}));

describe('RegisterPage (app/register)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Create an Account | RFPNexa Procurement Admin');
    expect(metadata.description).toContain('Register for RFPNexa');
  });

  it('renders AuthCard title, description, and login link', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(
      screen.getByText('Get access to federal, state, and local government tenders'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-register-form')).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /Log in instead/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
