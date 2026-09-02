import { ChevronDown } from 'lucide-react';

interface DropdownButtonProps {
  displayText: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  error?: string | undefined;
}

export default function DropdownButton({
  displayText,
  isOpen,
  setIsOpen,
  error,
}: DropdownButtonProps) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border flex items-center justify-between text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent ${
        error ? 'border-red-500' : 'border-[var(--border)]'
      }`}
    >
      <span
        className={
          displayText !== 'Select Country' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'
        }
      >
        {displayText}
      </span>
      <ChevronDown
        className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
}
