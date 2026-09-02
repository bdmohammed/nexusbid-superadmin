import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GlobalError from '../global-error';

import type { SerializedError } from '@/lib/errors/types';
import { ERROR_CODES } from '@/lib/errors/constants';
import * as errorUtils from '@/lib/errors/utils';

const mockSerializedError: SerializedError = {
  errorId: 'mock-error-id',
  message: 'Mock error message',
  code: ERROR_CODES.UNKNOWN,
  statusCode: 500,
};

vi.spyOn(errorUtils, 'handleClientError').mockReturnValue(mockSerializedError);

describe('GlobalError Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fatal error message and description', () => {
    const mockError = new Error('Fatal Layout Crash') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('A Fatal Error Occurred')).toBeInTheDocument();
    expect(
      screen.getByText(/The application encountered a critical layout rendering failure/i),
    ).toBeInTheDocument();
  });

  it('logs error via handleClientError', () => {
    const mockError = new Error('Fatal Error with Digest') as Error & { digest?: string };
    mockError.digest = 'global-digest-999';
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(errorUtils.handleClientError).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        component: 'GlobalError',
        digest: 'global-digest-999',
      }),
    );
  });

  it('triggers reset on clicking "Try Fast Recovery"', () => {
    const mockError = new Error('Fatal Error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    const recoveryBtn = screen.getByRole('button', { name: /Try Fast Recovery/i });
    fireEvent.click(recoveryBtn);

    expect(mockReset).toHaveBeenCalled();
  });
});
