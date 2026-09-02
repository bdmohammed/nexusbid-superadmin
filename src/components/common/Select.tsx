import type { SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ value, onChange, children, className, ...props }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-10 rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      {...props}
    >
      {children}
    </select>
  );
}
