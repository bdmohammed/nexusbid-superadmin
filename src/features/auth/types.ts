export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    password?: string; // backend dto has password or newPassword?
}

export interface User {
    id: string;
    name: string;
    email: string;
    accountType: 'user' | 'admin';
    companyName: string | null;
    country: string | null;
    emailVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
}

export interface CsrfTokenResponse {
    csrfToken: string;
}