export interface User {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    country: string | null;
    role: 'customer' | 'admin';
    adminRole: 'super_admin' | 'manager' | 'viewer' | null;
    emailVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}