import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardLayout from '../DashboardLayout';
import Overlay from '../Overlay';
import Topbar from '../Topbar';

import { useAuthStore } from '@/features/auth/store/store';
import { useSidebarStore, useThemeStore } from '@/store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../common/Avatar', () => ({
  default: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

describe('Layout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        name: 'Alice Admin',
        email: 'alice@rfpnexa.com',
        accountType: 'admin',
        emailVerified: true,
        isBlocked: false,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      } as any,
      isAuthenticated: true,
    });
  });

  it('renders DashboardLayout with child contents and Topbar', () => {
    render(
      <DashboardLayout>
        <div data-testid="dashboard-content">Welcome to Dashboard Main Content</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
  });

  it('renders Topbar with user name and theme toggle button', () => {
    render(<Topbar />);

    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    const themeBtn = screen.getByRole('button', { name: /Toggle dark mode/i });
    expect(themeBtn).toBeInTheDocument();

    const initialTheme = useThemeStore.getState().theme;
    fireEvent.click(themeBtn);
    expect(useThemeStore.getState().theme).not.toBe(initialTheme);
  });

  it('toggles mobile sidebar overlay and handles click outside', () => {
    useSidebarStore.setState({ isOpen: true });
    const { container } = render(<Overlay />);

    const overlayElement = container.querySelector('.fixed.inset-0');
    expect(overlayElement).toBeInTheDocument();
    expect(overlayElement).not.toBeNull();

    fireEvent.click(overlayElement as HTMLElement);
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });
});
