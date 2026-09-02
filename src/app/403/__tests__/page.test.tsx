import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ForbiddenPage from '../page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ForbiddenPage (403)', () => {
  it('renders 403 Forbidden title and explanation message', () => {
    render(<ForbiddenPage />);

    expect(screen.getByText('403 Forbidden')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Access Denied. The initial system installation and setup wizard has already been completed./i,
      ),
    ).toBeInTheDocument();
  });

  it('navigates to /login when clicking "Go to Sign In" button', () => {
    render(<ForbiddenPage />);

    const signInButton = screen.getByRole('button', { name: /Go to Sign In/i });
    expect(signInButton).toBeInTheDocument();

    fireEvent.click(signInButton);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
