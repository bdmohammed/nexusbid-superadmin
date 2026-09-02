import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegisterForm } from '../RegisterForm';

import * as registerHook from '@/features/auth/hooks/useRegisterForm';

vi.mock('@/components/auth/CountryDropdown', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select
      aria-label="Country"
      data-testid="country-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Country</option>
      <option value="US">United States</option>
      <option value="CA">Canada</option>
    </select>
  ),
}));

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form sections including personal info, company, passwords, and terms', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByTestId('country-dropdown')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('renders RegistrationSuccess view when registration succeeds', () => {
    vi.spyOn(registerHook, 'useRegisterForm').mockReturnValue({
      methods: {
        register: vi.fn(),
        formState: { errors: {} },
      } as any,
      successMsg: 'Registration successful! Verification email sent.',
      isSubmitting: false,
      handleSubmit: vi.fn(),
    });

    render(<RegisterForm />);

    expect(screen.getByText('Account Created!')).toBeInTheDocument();
    expect(
      screen.getByText('Registration successful! Verification email sent.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Proceed to Login/i })).toBeInTheDocument();
  });
});
