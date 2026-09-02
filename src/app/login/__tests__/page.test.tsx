import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import LoginPage, { metadata } from '../page';

vi.mock('@/features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="mock-login-form">Mocked Login Form</div>,
}));

describe('LoginPage (app/login)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Admin Sign In | RFPNexa Procurement Admin');
    expect(metadata.description).toBe(
      'Sign in to manage RFPNexa procurement tenders and administration.',
    );
  });

  it('renders AuthCard title, description, and register link', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Log in to manage your procurement tenders')).toBeInTheDocument();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();

    const registerLink = screen.getByRole('link', { name: /Register for free/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
