import { Suspense } from 'react';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { VerifyEmailContent } from '@/features/auth/components/VerifyEmailContent';

export const metadata: Metadata = {
  title: 'Verify Email | RFPNexa Procurement Admin',
  description: 'Verify your administrator email address.',
};

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Email Verification">
      <Suspense
        fallback={<div className="py-12 flex justify-center text-[var(--muted)]">Loading...</div>}
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
