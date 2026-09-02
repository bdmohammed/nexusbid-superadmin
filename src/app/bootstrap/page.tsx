import { Suspense } from 'react';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { BootstrapContent } from '@/features/auth/components/BootstrapContent';

export const metadata: Metadata = {
  title: 'Admin Bootstrap Setup | RFPNexa Procurement Admin',
  description: 'Initialize and approve the first administrator for RFPNexa.',
};

export default function BootstrapPage() {
  return (
    <AuthCard
      badge="System Initialization"
      title="Admin Bootstrap Setup"
      description="Review and approve the first administrator to initialize the RFPNexa enterprise environment."
      maxWidth="max-w-lg"
    >
      <Suspense
        fallback={<div className="py-12 flex justify-center text-[var(--muted)]">Loading...</div>}
      >
        <BootstrapContent />
      </Suspense>
    </AuthCard>
  );
}
