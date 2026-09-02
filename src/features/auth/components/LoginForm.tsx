'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { getErrorMessage, getValidationErrors } from '@/lib/errors';

const loginSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email address' })
    .transform((value) => value.toLowerCase()),
  password: z.string().trim().min(1, { error: 'Password is required' }),
  fax_number: z.string().optional(), // Honeypot field
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const { login, isLoggingIn, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user || isAuthenticated) {
      router.replace(redirect);
    }
  }, [user, isAuthenticated, router, redirect]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      fax_number: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Honeypot check
    if (data.fax_number) {
      console.warn('Spam detected via honeypot');
      return;
    }

    try {
      await login({
        email: data.email,
        password: data.password,
      });
      toast.success('Logged in successfully!');
      router.replace(redirect);
      router.refresh();
    } catch (err: unknown) {
      const backendErrors = getValidationErrors(err);
      if (backendErrors) {
        backendErrors.forEach((e: { field: string; message: string }) => {
          setError(e.field as keyof LoginFormValues, {
            type: 'manual',
            message: e.message,
          });
        });
      } else {
        const msg = getErrorMessage(err) || 'Invalid email or password.';
        toast.error(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Honeypot field */}
      <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="fax_number">Fax Number</label>
        <input
          id="fax_number"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('fax_number')}
        />
      </div>

      <div>
        <label
          htmlFor="login-email"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
        >
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
            errors.email ? 'border-red-500' : 'border-[var(--border)]'
          }`}
          placeholder="name@company.com"
          {...register('email')}
        />
        {errors.email && (
          <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`w-full pl-4 pr-11 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
              errors.password ? 'border-red-500' : 'border-[var(--border)]'
            }`}
            placeholder="Enter Password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-hidden cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
        )}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-[#003EC7] hover:underline block mt-2"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoggingIn}
        className="w-full py-3.5 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoggingIn ? (
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
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </button>
    </form>
  );
}

export default LoginForm;
