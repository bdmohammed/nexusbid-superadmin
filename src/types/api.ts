export interface ApiSuccessResponse<T = unknown, M = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: M;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown, M = unknown> =
  | ApiSuccessResponse<T, M>
  | ApiErrorResponse;

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ContactDto {
  name: string;
  email: string;
  message: string;
}
