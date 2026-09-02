import React from 'react';
import { clsx } from 'clsx';

export interface AuthCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  badge,
  icon,
  maxWidth = 'max-w-md',
  footer,
  children,
  className = '',
}: AuthCardProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
      <div
        className={clsx(
          `w-full p-8 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-xl relative overflow-hidden`,
          maxWidth,
          className,
        )}
      >
        {/* Glow ambient background accents */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Header section */}
        <div className="text-center mb-8 relative z-10">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003EC7]/10 border border-[#003EC7]/20 text-xs font-semibold text-[#003EC7] mb-4 uppercase tracking-wider">
              {badge}
            </div>
          )}
          {icon && <div className="flex justify-center mb-4">{icon}</div>}
          {title && (
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {title}
            </h1>
          )}
          {description && <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>}
        </div>

        {/* Main Content */}
        <div className="relative z-10">{children}</div>

        {/* Optional Footer Link / Notice */}
        {footer && (
          <div className="mt-8 text-center text-sm text-[var(--muted)] relative z-10">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default AuthCard;
