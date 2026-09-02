import { Suspense } from 'react';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | RFPNexa Procurement Admin',
  description: 'Set a new secure password for your administrator account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthCard title="New Password" description="Enter your new password below">
      <Suspense
        fallback={<div className="py-12 flex justify-center text-[var(--muted)]">Loading...</div>}
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
