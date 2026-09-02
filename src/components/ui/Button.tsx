import type { LucideProps } from 'lucide-react';
import type {
  ButtonHTMLAttributes,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import { cn } from '@/lib/tailwind/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  rightIcon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}

export default function Button({
  fullWidth = false,
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white border border-primary hover:opacity-90',
    secondary: 'border border-border bg-surface text-text hover:bg-sidebar-hover',
    outline: 'border border-border bg-surface text-text hover:bg-sidebar-hover',
    danger: 'border border-red-600 bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-text hover:bg-sidebar-hover',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth && 'w-full',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {LeftIcon && <LeftIcon size={18} />}
      {children}
      {RightIcon && <RightIcon size={18} />}
    </button>
  );
}
