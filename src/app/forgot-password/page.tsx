import { Suspense } from 'react';
import { Mail } from 'lucide-react';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | RFPNexa Procurement Admin',
  description: 'Reset your administrator account password.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#003EC7]/10 border border-[#003EC7]/20">
          <Mail className="w-7 h-7 text-[#003EC7]" />
        </div>
      }
      title="Forgot Password?"
      description="Enter your email and we'll send you a reset link."
    >
      <Suspense
        fallback={<div className="py-12 flex justify-center text-[var(--muted)]">Loading...</div>}
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
