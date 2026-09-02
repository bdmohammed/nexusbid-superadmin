import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QueryProvider from '../QueryProvider';

import { getQueryClient } from '@/lib/query/queryClient';

const queryClient = new QueryClient();

const QueryClientProviderMock = vi.fn(({ children }: any) => <>{children}</>);

const ReactQueryDevtoolsMock = vi.fn(() => <div data-testid="react-query-devtools" />);

vi.mock('@/lib/query/queryClient', () => ({
  getQueryClient: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');

  return {
    ...actual,
    QueryClientProvider: (props: any) => {
      QueryClientProviderMock(props);
      return <>{props.children}</>;
    },
  };
});

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => {
    ReactQueryDevtoolsMock();
    return <div data-testid="react-query-devtools" />;
  },
}));

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getQueryClient).mockReturnValue(queryClient);
  });

  it('renders children', () => {
    render(
      <QueryProvider>
        <div>Dashboard</div>
      </QueryProvider>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('gets query client', () => {
    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    expect(getQueryClient).toHaveBeenCalledTimes(1);
  });

  it.todo('passes query client to QueryClientProvider', () => {
    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    expect(QueryClientProviderMock).toHaveBeenCalled();

    // expect(QueryClientProviderMock.mock.calls[0][0].client).toBe(
    //   queryClient,
    // );
  });

  it('renders ReactQueryDevtools', () => {
    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();
  });

  it.todo('passes initialIsOpen=false to ReactQueryDevtools', () => {
    render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    );

    expect(ReactQueryDevtoolsMock).toHaveBeenCalled();

    // expect(
    //   ReactQueryDevtoolsMock.mock.calls[0][0].initialIsOpen,
    // ).toBe(false);
  });

  it.todo('renders children inside QueryClientProvider', () => {
    render(
      <QueryProvider>
        <span>Child Component</span>
      </QueryProvider>,
    );

    expect(QueryClientProviderMock.mock.calls[0]![0].children).toBeTruthy();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
