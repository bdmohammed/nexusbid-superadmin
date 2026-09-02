import { Suspense } from 'react';
import Link from 'next/link';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Admin Sign In | RFPNexa Procurement Admin',
  description: 'Sign in to manage RFPNexa procurement tenders and administration.',
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Log in to manage your procurement tenders"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-[#003EC7] hover:underline">
            Register for free
          </Link>
        </>
      }
    >
      <Suspense
        fallback={<div className="py-12 flex justify-center text-[var(--muted)]">Loading...</div>}
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
