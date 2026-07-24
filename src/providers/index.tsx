'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';

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
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        duration={4000}
                    />
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}