import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import RootError from '../error';

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

describe('RootError Component', () => {
  it('calls handleClientError with error details on render', () => {
    const mockError = new Error('Test unexpected render crash') as Error & { digest?: string };
    mockError.digest = 'digest-12345';
    const mockReset = vi.fn();

    render(<RootError error={mockError} reset={mockReset} />);

    expect(errorUtils.handleClientError).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        component: 'RootError',
        digest: 'digest-12345',
      }),
    );
  });

  it('renders ErrorFallback and triggers reset function when clicked', () => {
    const mockError = new Error('Database connection failed') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<RootError error={mockError} reset={mockReset} />);

    // Try Again button from ErrorFallback
    const retryButton = screen.getByRole('button', { name: /Try Again|Reload/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalled();
  });
});
