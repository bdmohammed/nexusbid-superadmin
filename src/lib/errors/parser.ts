// import { AxiosError } from 'axios';
// import { AppError } from './AppError';
// import { ERROR_CODES, ErrorCode } from './constants';
// import { ApiErrorResponse } from '../http/types';

// export function parseError(error: unknown): AppError {
//   if (error instanceof AppError) {
//     return error;
//   }

//   // 1. Handle Axios errors
//   if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
//     const axiosError = error as AxiosError<ApiErrorResponse>;
//     const response = axiosError.response;
//     const responseData = response?.data;

//     // Check if it's a network error (no response)
//     if (!response) {
//       return new AppError(
//         'A network error occurred. Please check your connection.',
//         0,
//         ERROR_CODES.NETWORK_OFFLINE,
//       );
//     }

//     const status = responseData?.statusCode || response.status || 500;
//     const message = responseData?.message || axiosError.message || 'An unexpected API error occurred';
//     const traceId = responseData?.timestamp;
//     const details = responseData?.errors ? { errors: responseData.errors } : undefined;

//     // Map status code or custom server error to ErrorCode
//     let code = ERROR_CODES.UNKNOWN as ErrorCode;
//     if (responseData?.error) {
//       const serverCode = String(responseData.error).toUpperCase();
//       if (Object.values(ERROR_CODES).includes(serverCode as ErrorCode)) {
//         code = serverCode as ErrorCode;
//       }
//     }

//     if (code === ERROR_CODES.UNKNOWN) {
//       if (status === 401) {
//         code = ERROR_CODES.UNAUTHORIZED;
//       } else if (status === 403) {
//         code = ERROR_CODES.FORBIDDEN;
//       } else if (status === 400 || status === 422) {
//         code = ERROR_CODES.VALIDATION;
//       } else if (status >= 500) {
//         code = ERROR_CODES.SERVER;
//       }
//     }

//     return new AppError(message, status, code, details, traceId);
//   }

//   // 2. Handle Standard JavaScript Error objects
//   if (error instanceof Error) {
//     return new AppError(error.message, 500, ERROR_CODES.UNKNOWN as ErrorCode);
//   }

//   // 3. Handle string errors
//   if (typeof error === 'string') {
//     return new AppError(error, 500, ERROR_CODES.UNKNOWN as ErrorCode);
//   }

//   // 4. Fallback for completely unknown error types
//   return new AppError('An unknown error occurred', 500, ERROR_CODES.UNKNOWN);
// }
