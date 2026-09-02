'use client';

import { Search } from 'lucide-react';

import type { ChangeEvent } from 'react';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
