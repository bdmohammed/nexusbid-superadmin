import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from './api';
import { authQueryKeys } from './keys';

import {
    ForgotPasswordDto,
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
} from '../types';

/**
 * Login
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: LoginDto) =>
            authApi.login(dto),

        onSuccess: async (response) => {
            queryClient.setQueryData(['auth', 'me'], response.data);

            await queryClient.invalidateQueries({
                queryKey: authQueryKeys.me(),
            });

            await queryClient.invalidateQueries({
                queryKey: authQueryKeys.session(),
            });
        },
    });
}

/**
 * Register
 */
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: RegisterDto) =>
            authApi.register(dto),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: authQueryKeys.me(),
            });
        },
    });
}

/**
 * Logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),

        onSuccess: async () => {
            // queryClient.removeQueries({
            //     queryKey: authQueryKeys.all,
            // });

            // queryClient.setQueryData(['auth', 'me'], null);
            // queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            // queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
            queryClient.clear();
        },
    });
}

/**
 * Forgot Password
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (dto: ForgotPasswordDto) =>
            authApi.forgotPassword(dto),
    });
}

/**
 * Reset Password
 */
export function useResetPassword() {
    return useMutation({
        mutationFn: (dto: ResetPasswordDto) =>
            authApi.resetPassword(dto),
    });
}

/**
 * Verify Email
 */
export function useVerifyEmail() {
    // const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) =>
            authApi.verifyEmail(token),

        // onSuccess: async () => {
        //     await queryClient.invalidateQueries({
        //         queryKey: authQueryKeys.me(),
        //     });

        //     await queryClient.invalidateQueries({
        //         queryKey: authQueryKeys.session(),
        //     });
        // },
    });
}

/**
 * Resend Verification Email
 */
export function useResendVerification() {
    return useMutation({
        mutationFn: (email: string) =>
            authApi.resendVerification(email),
    });
}