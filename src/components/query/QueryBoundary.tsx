import { ReactNode } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { AppError } from '@/lib/error/AppError';
import ErrorState from './ErrorState';

interface QueryBoundaryProps<TData, TError = AppError> {
  query: UseQueryResult<TData, TError>;
  skeleton?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode | ((error: TError, retry: () => void) => ReactNode);
  isEmpty?: (data: TData) => boolean;
  children: ReactNode | ((data: TData) => ReactNode);
}

function defaultIsEmpty(data: any): boolean {
  if (data === null || data === undefined) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  if (typeof data === 'object') {
    if ('data' in data) {
      return defaultIsEmpty(data.data);
    }
    if ('success' in data && data.success === false) {
      return true;
    }
  }
  return false;
}

export default function QueryBoundary<TData, TError = AppError>({
  query,
  skeleton,
  empty,
  error,
  isEmpty = defaultIsEmpty,
  children,
}: QueryBoundaryProps<TData, TError>) {
  const { isPending, isError, data, error: queryError, refetch } = query;

  // 1. Pending / Loading state
  if (isPending) {
    return <>{skeleton || <div className="h-32 w-full animate-pulse bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl" />}</>;
  }

  // 2. Error state
  if (isError) {
    if (typeof error === 'function') {
      return <>{error(queryError, refetch)}</>;
    }
    if (error) {
      return <>{error}</>;
    }
    return (
      <ErrorState
        error={queryError instanceof Error ? queryError : new Error(String(queryError))}
        retry={refetch}
      />
    );
  }

  // 3. Empty state
  if (data !== undefined && isEmpty(data)) {
    if (empty) {
      return <>{empty}</>;
    }
  }

  // 4. Success state with data
  if (data !== undefined) {
    if (typeof children === 'function') {
      return <>{children(data)}</>;
    }
    return <>{children}</>;
  }

  return null;
}
