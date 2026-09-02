import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/tailwind/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn('max-w-screen-2xl mx-auto', className)} {...props}>
      {children}
    </div>
  );
}
