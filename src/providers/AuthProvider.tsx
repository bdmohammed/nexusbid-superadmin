'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authApi } from '@/features/auth/api/api';
import { useCurrentUser } from '@/features/auth/api/queries';
import { useAuthStore } from '@/features/auth/store/store';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const initialize = useAuthStore((state) => state.initialize);
  const queryClient = useQueryClient();
  const prevPathnameRef = useRef<string | null>(null);
  const initialCheckDoneRef = useRef<boolean>(false);
  const loggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    if (isLoading) return;

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isGuestPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    // Reset check flag when route changes
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      initialCheckDoneRef.current = false;
    }

    // Only check for pre-existing session logout ONCE when arriving at /login or /register
    if (!initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;

      if (user && isGuestPage) {
        if (loggingOutRef.current) return;
        loggingOutRef.current = true;

        // Pre-existing session on guest page arrival: run logout API & clear session
        (async () => {
          try {
            await authApi.logout();
          } catch (e) {
            console.error('Logout API error on guest page access:', e);
          } finally {
            if (typeof document !== 'undefined') {
              document.cookie.split(';').forEach((c) => {
                document.cookie = c
                  .replace(/^ +/, '')
                  .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
              });
            }
            initialize(null);
            queryClient.clear();
            toast.info('Logged out of existing session.');
            loggingOutRef.current = false;
          }
        })();
        return;
      }
    }

    initialize(user ?? null);
  }, [isLoading, user, initialize, queryClient]);

  return children;
}
