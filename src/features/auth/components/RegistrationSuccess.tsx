import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface RegistrationSuccessProps {
  message: string;
}

export function RegistrationSuccess({ message }: RegistrationSuccessProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--foreground)]">Account Created!</h2>
      <p className="text-sm text-[var(--muted)] max-w-md">{message}</p>
      <Link
        href="/login"
        className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
      >
        Proceed to Login
      </Link>
    </div>
  );
}
