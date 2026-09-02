import { Shield } from 'lucide-react';

import { cn } from '@/lib/tailwind/utils';

export interface LogoProps {
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ variant = 'light', showText = true }: LogoProps) {
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/25">
        <Shield size={20} className="text-white" />
      </div>
      {showText && (
        <div className="transition-all duration-300">
          <h2
            className={cn('text-base font-bold leading-tight', isDark ? 'text-white' : 'text-text')}
          >
            TenderPro
          </h2>
          <p
            className={cn(
              'text-[11px] font-medium uppercase tracking-wide',
              isDark ? 'text-zinc-500' : 'text-text-light',
            )}
          >
            Super Admin
          </p>
        </div>
      )}
    </div>
  );
}
