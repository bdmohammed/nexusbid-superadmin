import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/tailwind/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: 'indigo' | 'green' | 'red' | 'yellow';
}

export default function Badge({ children, color = 'indigo', className, ...props }: BadgeProps) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span
      className={cn('px-3 py-1 rounded-full text-xs font-medium', colors[color], className)}
      {...props}
    >
      {children}
    </span>
  );
}
