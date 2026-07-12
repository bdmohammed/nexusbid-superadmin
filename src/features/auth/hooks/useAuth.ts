import { useMemo } from 'react';

import { useCurrentUser } from '../api/queries';
import {
    useLogin,
    useLogout,
    useRegister,
    useForgotPassword,
    useResetPassword,
    useVerifyEmail,
    useResendVerification,
} from '../api/mutations';

import { useAuthStore } from '../store/store';

export function useAuth() {
    const me = useCurrentUser();

    const login = useLogin();
    const register = useRegister();
    const logout = useLogout();
    const forgotPassword = useForgotPassword();
    const resetPassword = useResetPassword();
    const verifyEmail = useVerifyEmail();
    const resendVerification = useResendVerification();

    const {
        isAuthenticated,
        isInitializing,
        setAuthenticated,
    } = useAuthStore();

    return useMemo(
        () => ({
            user: me.data ?? null,

            isAuthenticated,
            isInitializing,

            isLoading: me.isLoading,
            isFetching: me.isFetching,
            isError: me.isError,
            error: me.error,

            refetch: me.refetch,

            login: login.mutateAsync,
            register: register.mutateAsync,
            logout: logout.mutateAsync,

            forgotPassword: forgotPassword.mutateAsync,
            resetPassword: resetPassword.mutateAsync,
            verifyEmail: verifyEmail.mutateAsync,
            resendVerification: resendVerification.mutateAsync,

            isLoggingIn: login.isPending,
            isRegistering: register.isPending,
            isLoggingOut: logout.isPending,
            isForgotSending: forgotPassword.isPending,
            isResetting: resetPassword.isPending,
            isVerifying: verifyEmail.isPending,
            isResendingVerification: resendVerification.isPending,

            loginError: login.error,
            registerError: register.error,
            logoutError: logout.error,
            forgotPasswordError: forgotPassword.error,
            resetPasswordError: resetPassword.error,
            verifyEmailError: verifyEmail.error,
            resendVerificationError: resendVerification.error,

            setAuthenticated,
        }),
        [
            me,
            login,
            register,
            logout,
            forgotPassword,
            resetPassword,
            verifyEmail,
            resendVerification,
            isAuthenticated,
            isInitializing,
            setAuthenticated,
        ],
    );
}