import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '../msw/server';

import { BootstrapContent } from '@/features/auth/components/BootstrapContent';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'test-bootstrap-token' : null),
  }),
}));

describe('Bootstrap Flow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches candidate info via MSW and executes approval', async () => {
    server.use(
      http.get('*/api/v1/auth/admin/bootstrap', () => {
        return HttpResponse.json({
          success: true,
          data: {
            name: 'John System Admin',
            email: 'sysadmin@rfpnexa.com',
          },
        });
      }),
      http.post('*/api/v1/auth/admin/bootstrap', () => {
        return HttpResponse.json({
          success: true,
          message: 'Bootstrap approved successfully',
        });
      }),
    );

    render(<BootstrapContent />);

    await waitFor(() => {
      expect(screen.getByText('John System Admin')).toBeInTheDocument();
      expect(screen.getByText('sysadmin@rfpnexa.com')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /Approve & Bootstrap/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByText(/System Bootstrapped!/i)).toBeInTheDocument();
    });
  });
});
