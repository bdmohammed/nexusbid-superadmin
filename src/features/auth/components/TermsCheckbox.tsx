'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import type { RegisterFormValues } from '../schemas/register.schema';

export function TermsCheckbox() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterFormValues>();

  return (
    <div className="flex flex-col mt-2">
      <div className="flex items-start">
        <input
          id="terms-checkbox"
          type="checkbox"
          aria-invalid={!!errors.terms}
          aria-describedby={errors.terms ? 'terms-error' : undefined}
          className="h-4 w-4 rounded-sm border-[var(--border)] bg-[var(--surface-secondary)] text-[#003EC7] focus:ring-[#003EC7] mt-0.5 cursor-pointer"
          {...register('terms')}
        />
        <label htmlFor="terms-checkbox" className="ml-2 text-xs text-[var(--muted)]">
          I agree to the{' '}
          <Link href="/terms" className="text-[#003EC7] hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#003EC7] hover:underline">
            Privacy Policy
          </Link>
          .
        </label>
      </div>
      {errors.terms && (
        <span id="terms-error" className="text-xs text-red-500 mt-1 block">
          {errors.terms.message}
        </span>
      )}
    </div>
  );
}
