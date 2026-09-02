import { screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import BootstrapPage, { metadata } from '../page';

vi.mock('@/features/auth/components/BootstrapContent', () => ({
  BootstrapContent: () => <div data-testid="mock-bootstrap-content">Mocked Bootstrap Content</div>,
}));

describe('BootstrapPage (app/bootstrap)', () => {
  it('defines correct page metadata', () => {
    expect(metadata.title).toBe('Admin Bootstrap Setup | RFPNexa Procurement Admin');
    expect(metadata.description).toBe(
      'Initialize and approve the first administrator for RFPNexa.',
    );
  });

  it('renders AuthCard badge, title, description, and bootstrap content', () => {
    render(<BootstrapPage />);

    expect(screen.getByText('System Initialization')).toBeInTheDocument();
    expect(screen.getByText('Admin Bootstrap Setup')).toBeInTheDocument();
    expect(screen.getByText(/Review and approve the first administrator/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-bootstrap-content')).toBeInTheDocument();
  });
});
