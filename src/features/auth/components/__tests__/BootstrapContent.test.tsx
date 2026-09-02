import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from '@tests/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BootstrapContent } from '../BootstrapContent';

import type { ApiResponse } from '@/lib/http/types';
import type { ApiErrorResponse } from '@/types';
import type { AxiosResponse } from 'axios';
import { authApi } from '@/features/auth/api/api';
import { getErrorMessage } from '@/lib/errors';

let currentToken: string | null = 'sample-bootstrap-token';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? currentToken : null),
  }),
}));

vi.mock('@/features/auth/api/api', () => ({
  authApi: {
    bootstrapVerify: vi.fn(),
    bootstrapApprove: vi.fn(),
  },
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: vi.fn(),
}));

describe('BootstrapContent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentToken = 'sample-bootstrap-token';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders error message if token is missing', async () => {
    currentToken = null;
    render(<BootstrapContent />);

    expect(await screen.findByText(/No bootstrap token provided/i)).toBeInTheDocument();

    expect(authApi.bootstrapVerify).not.toHaveBeenCalled();
  });

  it('verifies token and renders admin details', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John Doe',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    render(<BootstrapContent />);

    expect(screen.getByText(/Verifying secure bootstrap token/i)).toBeInTheDocument();

    expect(await screen.findByText('John Doe')).toBeInTheDocument();

    expect(screen.getByText('john@test.com')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /Approve & Bootstrap/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders candidate details when token is successfully verified', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          name: 'Sarah Connor',
          email: 'sarah@rfpnexa.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    render(<BootstrapContent />);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('sarah@rfpnexa.com')).toBeInTheDocument();
      expect(screen.getByText('SUPER_ADMIN')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Approve & Bootstrap/i })).toBeInTheDocument();
    });
  });

  it('approves bootstrap candidate on button click and shows confirmation', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          name: 'Sarah Connor',
          email: 'sarah@rfpnexa.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValueOnce({
      data: {
        success: true,
      },
    } as AxiosResponse<ApiResponse<undefined>>);

    render(<BootstrapContent />);

    const approveBtn = await screen.findByRole('button', { name: /Approve & Bootstrap/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(authApi.bootstrapApprove).toHaveBeenCalledWith('sample-bootstrap-token', 'approve');
      expect(screen.getByText('System Bootstrapped!')).toBeInTheDocument();
    });
  });

  it('shows verification api error', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: false,
        message: 'Invalid token',
      },
    } as AxiosResponse<ApiErrorResponse>);

    render(<BootstrapContent />);

    expect(await screen.findByText('Invalid token')).toBeInTheDocument();
  });

  it('shows thrown verification error', async () => {
    vi.mocked(authApi.bootstrapVerify).mockRejectedValue(new Error());

    vi.mocked(getErrorMessage).mockReturnValue('Expired token');

    render(<BootstrapContent />);

    expect(await screen.findByText('Expired token')).toBeInTheDocument();
  });

  it('approves bootstrap successfully', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValue({
      data: {
        success: true,
      },
    } as AxiosResponse<ApiResponse<undefined>>);

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Approve & Bootstrap/i,
      }),
    );

    expect(await screen.findByText(/System Bootstrapped!/i)).toBeInTheDocument();

    expect(authApi.bootstrapApprove).toHaveBeenCalledWith('sample-bootstrap-token', 'approve');
  });

  it.todo('redirects after approval', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValue({
      data: {
        success: true,
      },
    } as AxiosResponse<ApiResponse<undefined>>);

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Approve & Bootstrap/i,
      }),
    );

    // Wait until the component reaches the success state
    expect(await screen.findByText(/System Bootstrapped!/i)).toBeInTheDocument();

    // NOW enable fake timers
    vi.useFakeTimers();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockPush).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  });

  it('shows approval api failure', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValue({
      data: {
        success: false,
        message: 'Approval failed',
      },
    } as AxiosResponse<ApiErrorResponse>);

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Approve & Bootstrap/i,
      }),
    );

    expect(await screen.findByText('Approval failed')).toBeInTheDocument();
  });

  it('shows thrown approval error', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockRejectedValue(new Error());

    vi.mocked(getErrorMessage).mockReturnValue('Network error');

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Approve & Bootstrap/i,
      }),
    );

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('rejects bootstrap request', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValue({
      data: {
        success: true,
      },
    } as AxiosResponse<ApiResponse<undefined>>);

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Reject Request/i,
      }),
    );

    expect(await screen.findByText(/Request Rejected/i)).toBeInTheDocument();

    expect(authApi.bootstrapApprove).toHaveBeenCalledWith('sample-bootstrap-token', 'reject');
  });

  it('shows reject api failure', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockResolvedValue({
      data: {
        success: false,
        message: 'Rejected failed',
      },
    } as AxiosResponse<ApiErrorResponse>);

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Reject Request/i,
      }),
    );

    expect(await screen.findByText('Rejected failed')).toBeInTheDocument();
  });

  it('shows thrown reject error', async () => {
    vi.mocked(authApi.bootstrapVerify).mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'John',
          email: 'john@test.com',
        },
      },
    } as AxiosResponse<ApiResponse<{ name: string; email: string }>>);

    vi.mocked(authApi.bootstrapApprove).mockRejectedValue(new Error());

    vi.mocked(getErrorMessage).mockReturnValue('Reject failed');

    render(<BootstrapContent />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Reject Request/i,
      }),
    );

    expect(await screen.findByText('Reject failed')).toBeInTheDocument();
  });

  it('renders login link on error', async () => {
    currentToken = '';

    render(<BootstrapContent />);

    expect(
      await screen.findByRole('link', {
        name: /Return to Sign In/i,
      }),
    ).toHaveAttribute('href', '/login');
  });
});
