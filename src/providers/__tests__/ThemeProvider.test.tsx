import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ThemeProvider from '../ThemeProvider';

const initializeMock = vi.fn();

vi.mock('@/store/theme.store', () => ({
  useThemeStore: (selector: any) =>
    selector({
      initialize: initializeMock,
    }),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>App Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('calls initialize on mount', () => {
    render(
      <ThemeProvider>
        <div>App Content</div>
      </ThemeProvider>,
    );

    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  it('does not call initialize again without remount', () => {
    const { rerender } = render(
      <ThemeProvider>
        <div>App Content</div>
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider>
        <div>App Content</div>
      </ThemeProvider>,
    );

    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  it('calls initialize again after remount', () => {
    const { unmount } = render(
      <ThemeProvider>
        <div>App</div>
      </ThemeProvider>,
    );

    expect(initializeMock).toHaveBeenCalledTimes(1);

    unmount();

    render(
      <ThemeProvider>
        <div>App</div>
      </ThemeProvider>,
    );

    expect(initializeMock).toHaveBeenCalledTimes(2);
  });
});
