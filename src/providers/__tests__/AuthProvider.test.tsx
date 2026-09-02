import { render, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '../AuthProvider';

import type { ApiResponse } from '@/lib/http';
import type { QueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { authApi } from '@/features/auth/api/api';
import { useCurrentUser } from '@/features/auth/api/queries';

vi.mock('@/features/auth/api/api', () => ({
  authApi: {
    logout: vi.fn(),
  },
}));

vi.mock('@/features/auth/api/queries', () => ({
  useCurrentUser: vi.fn(),
}));

const initialize = vi.fn();

vi.mock('@/features/auth/store/store', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      initialize,
    }),
  ),
}));

const clear = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');

  return {
    ...actual,
    useQueryClient: () =>
      ({
        clear,
      }) as unknown as QueryClient,
  };
});

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/dashboard',
      },
    });

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'a=1; b=2',
    });
  });

  it('does nothing while loading', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useCurrentUser>);

    render(
      <AuthProvider>
        <div>App</div>
      </AuthProvider>,
    );

    expect(initialize).not.toHaveBeenCalled();
  });

  it('initializes authenticated user', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        id: '1',
        name: 'John',
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(initialize).toHaveBeenCalledWith({
        id: '1',
        name: 'John',
      });
    });
  });

  it('initializes guest', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(initialize).toHaveBeenCalledWith(null);
    });
  });

  it('logs out existing session on login page', async () => {
    window.location.pathname = '/login';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockResolvedValue(
      undefined as unknown as AxiosResponse<ApiResponse<void>, any, {}, any>,
    );

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(initialize).toHaveBeenCalledWith(null);
      expect(clear).toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith('Logged out of existing session.');
    });
  });

  it('logs out existing session on register page', async () => {
    window.location.pathname = '/register';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockResolvedValue(
      undefined as unknown as AxiosResponse<ApiResponse<void>, any, {}, any>,
    );

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalledOnce();
    });
  });

  it('continues cleanup when logout fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    window.location.pathname = '/login';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'));

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(initialize).toHaveBeenCalledWith(null);
      expect(clear).toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalled();
    });
  });

  it('does not logout on protected pages', async () => {
    window.location.pathname = '/dashboard';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(authApi.logout).not.toHaveBeenCalled();
      expect(initialize).toHaveBeenCalledWith({
        id: '1',
      });
    });
  });

  it('clears query cache after logout', async () => {
    window.location.pathname = '/login';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockResolvedValue(
      undefined as unknown as AxiosResponse<ApiResponse<void>, any, {}, any>,
    );

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(clear).toHaveBeenCalledTimes(1);
    });
  });

  it('shows logout toast', async () => {
    window.location.pathname = '/login';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockResolvedValue(
      undefined as unknown as AxiosResponse<ApiResponse<void>, any, {}, any>,
    );

    render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Logged out of existing session.');
    });
  });

  it('does not call logout twice on rerender', async () => {
    window.location.pathname = '/login';

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>);

    vi.mocked(authApi.logout).mockResolvedValue(
      undefined as unknown as AxiosResponse<ApiResponse<void>, any, {}, any>,
    );

    const { rerender } = render(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    rerender(
      <AuthProvider>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalledTimes(1);
    });
  });
});
