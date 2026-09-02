'use client';

import { type ReactNode, useEffect } from 'react';

import { useThemeStore } from '@/store/theme.store';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const initialize = useThemeStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
