import { AxiosInstance } from 'axios';

import { clearCsrfToken, fetchCsrfToken } from '../csrf';
import { HTTP_STATUS } from '../constants';
import { refreshSession } from '../refresh';
import { ApiAxiosError, RetryRequestConfig } from '../types';
import { normalizeError } from '@/lib/errors';

/**
 * Register response interceptor.
 */
export function setupResponseInterceptor(api: AxiosInstance): void {
    api.interceptors.response.use(
        (response) => response,

        async (error: ApiAxiosError) => {
            const originalRequest = error.config as RetryRequestConfig;

            if (!originalRequest) {
                return Promise.reject(error);
            }

            /**
             * ------------------------------------------------------------
             * 419 - Invalid / Expired CSRF Token
             * ------------------------------------------------------------
             */
            if (
                error.response?.status === HTTP_STATUS.CSRF_TOKEN_INVALID &&
                !originalRequest._csrfRetry
            ) {
                originalRequest._csrfRetry = true;
                clearCsrfToken();
                await fetchCsrfToken();
                return api(originalRequest);
            }

            /**
             * ------------------------------------------------------------
             * 401 - Access Token Expired
             * ------------------------------------------------------------
             */
            if (
                error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;
                try {
                    await refreshSession();
                    return api(originalRequest);
                } catch (refreshError) {
                    clearCsrfToken();
                    return Promise.reject(normalizeError(refreshError));
                }
            }

            return Promise.reject(normalizeError(error));
        },
    );
}