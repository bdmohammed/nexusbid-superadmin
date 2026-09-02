import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { PasswordChecklist } from '../PasswordChecklist';

interface FormValues {
  password: string;
}

function TestForm() {
  const methods = useForm<FormValues>({
    defaultValues: {
      password: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <input aria-label="Password" {...methods.register('password')} />

        <PasswordChecklist />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe('PasswordChecklist', () => {
  it('does not render before password field is touched or changed', () => {
    render(<TestForm />);

    expect(screen.queryByText('Password Requirements')).not.toBeInTheDocument();
  });

  it('renders checklist after password field is touched', () => {
    render(<TestForm />);

    const input = screen.getByLabelText(/password/i);

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(screen.getByText('Password Requirements')).toBeInTheDocument();
  });

  it('renders checklist after password field becomes dirty', () => {
    render(<TestForm />);

    const input = screen.getByLabelText(/password/i);

    fireEvent.change(input, {
      target: { value: 'abc' },
    });

    expect(screen.getByText('Password Requirements')).toBeInTheDocument();
  });

  it('shows all password requirements', () => {
    render(<TestForm />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'abc' },
    });

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('At least one number')).toBeInTheDocument();
    expect(screen.getByText('At least one special character')).toBeInTheDocument();
  });

  it('marks only lowercase rule as satisfied for "abc"', () => {
    render(<TestForm />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'abc' },
    });

    expect(screen.getByText('At least one lowercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    expect(screen.getByText('At least 8 characters')).toHaveClass('text-[var(--muted)]');

    expect(screen.getByText('At least one uppercase letter')).toHaveClass('text-[var(--muted)]');

    expect(screen.getByText('At least one number')).toHaveClass('text-[var(--muted)]');

    expect(screen.getByText('At least one special character')).toHaveClass('text-[var(--muted)]');
  });

  it('satisfies all requirements for a strong password', () => {
    render(<TestForm />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    expect(screen.getByText('At least 8 characters')).toHaveClass('text-[var(--foreground)]');

    expect(screen.getByText('At least one uppercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    expect(screen.getByText('At least one lowercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    expect(screen.getByText('At least one number')).toHaveClass('text-[var(--foreground)]');

    expect(screen.getByText('At least one special character')).toHaveClass(
      'text-[var(--foreground)]',
    );
  });

  it('updates checklist as user types', () => {
    render(<TestForm />);

    const input = screen.getByLabelText(/password/i);

    fireEvent.change(input, {
      target: { value: 'abc' },
    });

    expect(screen.getByText('At least one lowercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    fireEvent.change(input, {
      target: { value: 'Password123!' },
    });

    expect(screen.getByText('At least 8 characters')).toHaveClass('text-[var(--foreground)]');

    expect(screen.getByText('At least one uppercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    expect(screen.getByText('At least one lowercase letter')).toHaveClass(
      'text-[var(--foreground)]',
    );

    expect(screen.getByText('At least one number')).toHaveClass('text-[var(--foreground)]');

    expect(screen.getByText('At least one special character')).toHaveClass(
      'text-[var(--foreground)]',
    );
  });
});
