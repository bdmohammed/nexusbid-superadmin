import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it } from 'vitest';

import { AuthCard } from '../AuthCard';

describe('AuthCard', () => {
  it('renders children', () => {
    render(
      <AuthCard>
        <div>Auth Content</div>
      </AuthCard>,
    );

    expect(screen.getByText('Auth Content')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(
      <AuthCard title="Welcome Back" description="Sign in to continue">
        <div>Content</div>
      </AuthCard>,
    );

    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();

    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
  });

  it('renders badge', () => {
    render(
      <AuthCard badge="Admin Portal">
        <div>Content</div>
      </AuthCard>,
    );

    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <AuthCard icon={<span data-testid="auth-icon">🔒</span>}>
        <div>Content</div>
      </AuthCard>,
    );

    expect(screen.getByTestId('auth-icon')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <AuthCard footer={<span>Need help?</span>}>
        <div>Content</div>
      </AuthCard>,
    );

    expect(screen.getByText('Need help?')).toBeInTheDocument();
  });

  it('uses default maxWidth class', () => {
    const { container } = render(
      <AuthCard>
        <div>Content</div>
      </AuthCard>,
    );

    expect(container.querySelector('.max-w-md')).toBeInTheDocument();
  });

  it('uses custom maxWidth class', () => {
    const { container } = render(
      <AuthCard maxWidth="max-w-xl">
        <div>Content</div>
      </AuthCard>,
    );

    expect(container.querySelector('.max-w-xl')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AuthCard className="custom-card">
        <div>Content</div>
      </AuthCard>,
    );

    expect(container.querySelector('.custom-card')).toBeInTheDocument();
  });

  it('does not render optional sections when props are omitted', () => {
    render(
      <AuthCard>
        <div>Content</div>
      </AuthCard>,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    expect(screen.queryByText(/Need help/i)).not.toBeInTheDocument();
  });

  it('renders all optional sections together', () => {
    render(
      <AuthCard
        badge="Admin"
        icon={<span data-testid="icon">🚀</span>}
        title="Dashboard"
        description="Manage your organization"
        footer={<span>Footer text</span>}
      >
        <button>Continue</button>
      </AuthCard>,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    expect(screen.getByText('Manage your organization')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});
