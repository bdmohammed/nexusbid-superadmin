'use client';

import { ReactNode } from 'react';

import QueryProvider from './QueryProvider';
import AuthProvider from './AuthProvider';
import ThemeProvider from './ThemeProvider';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({
    children,
}: ProvidersProps) {
    return (
        <QueryProvider>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}