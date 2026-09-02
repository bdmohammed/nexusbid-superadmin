'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { forgotPassword, isForgotSending } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isValid },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword({ email: data.email });
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || 'Failed to send reset link. Please try again.';
      toast.error(msg);
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          Check your inbox
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-xs">
          If an account exists for{' '}
          <span className="font-semibold text-[var(--foreground)]">{getValues('email')}</span>,
          you&apos;ll receive a password reset link shortly.
        </p>
        <p className="text-xs text-[var(--muted)]">
          Didn&apos;t get it? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[#003EC7] hover:underline font-semibold cursor-pointer"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#003EC7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="forgot-email"
            className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
              errors.email ? 'border-red-500' : 'border-[var(--border)]'
            }`}
            placeholder="name@company.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isForgotSending}
          className="w-full py-3.5 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isForgotSending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </>
  );
}

export default ForgotPasswordForm;
