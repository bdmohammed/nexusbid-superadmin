import Link from 'next/link';

import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an Account | RFPNexa Procurement Admin',
  description:
    'Register for RFPNexa to get access to federal, state, and local government procurement tenders.',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an Account"
      description="Get access to federal, state, and local government tenders"
      maxWidth="max-w-2xl"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#003EC7] hover:underline">
            Log in instead
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
