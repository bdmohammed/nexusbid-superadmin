import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegisterForm } from '../useRegisterForm';

import { useRegister } from '@/features/auth/api/mutations';
import * as errorUtils from '@/lib/errors';

vi.mock('@/features/auth/api/mutations', () => ({
  useRegister: vi.fn(),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: vi.fn(),
  getValidationErrors: vi.fn(),
}));

describe('useRegisterForm', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRegister).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
  });

  it('initializes form correctly', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.successMsg).toBeNull();
    expect(result.current.isSubmitting).toBe(false);

    expect(result.current.methods.getValues()).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      countryId: '',
      secondary_website: '',
      terms: false,
    });
  });

  it('submits valid registration successfully', async () => {
    mutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.methods.reset({
        name: 'John',
        email: 'john@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Acme',
        countryId: '1',
        secondary_website: '',
        terms: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@test.com',
      password: 'Password123!',
      companyName: 'Acme',
      countryId: '1',
    });

    expect(result.current.successMsg).toBe(
      'Registration successful! Please check your email for a verification link.',
    );
  });

  it('blocks spam submissions via honeypot', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.methods.reset({
        name: 'John',
        email: 'john@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Acme',
        countryId: '1',
        secondary_website: 'https://spam.com',
        terms: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(warnSpy).toHaveBeenCalledWith('Spam submission blocked via honeypot.');

    expect(mutateAsync).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('maps backend validation errors to form fields', async () => {
    const backendError = new Error('Validation failed');

    mutateAsync.mockRejectedValue(backendError);

    vi.mocked(errorUtils.getValidationErrors).mockReturnValue([
      {
        field: 'email',
        message: 'Email already exists',
      },
      {
        field: 'country',
        message: 'Country is invalid',
      },
    ]);

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.methods.reset({
        name: 'John',
        email: 'john@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Acme',
        countryId: '1',
        secondary_website: '',
        terms: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.methods.getFieldState('email').error?.message).toBe(
      'Email already exists',
    );

    expect(result.current.methods.getFieldState('countryId').error?.message).toBe(
      'Country is invalid',
    );
  });

  it('sets root error when validation errors are absent', async () => {
    const backendError = new Error('Server Error');

    mutateAsync.mockRejectedValue(backendError);

    vi.mocked(errorUtils.getValidationErrors).mockReturnValue(undefined);

    vi.mocked(errorUtils.getErrorMessage).mockReturnValue('Registration failed');

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.methods.reset({
        name: 'John',
        email: 'john@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Acme',
        countryId: '1',
        secondary_website: '',
        terms: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Read from the internal control reference (ignores batching/async cycles)
    expect(result.current.methods.control._formState.errors.root?.message).toBe(
      'Registration failed',
    );
  });

  it('uses fallback error message when getErrorMessage returns undefined', async () => {
    mutateAsync.mockRejectedValue(new Error());

    vi.mocked(errorUtils.getValidationErrors).mockReturnValue(undefined);

    vi.mocked(errorUtils.getErrorMessage).mockReturnValue('');

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.methods.reset({
        name: 'John',
        email: 'john@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Acme',
        countryId: '1',
        secondary_website: '',
        terms: true,
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Read from the internal control reference (ignores batching/async cycles)
    expect(result.current.methods.control._formState.errors.root?.message).toBe(
      'Failed to register account.',
    );
  });

  it('returns loading state from mutation', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutateAsync,
      isPending: true,
    } as never);

    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.isSubmitting).toBe(true);
  });
});
