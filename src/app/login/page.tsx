"use client";

import {
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/useAuth";

const loginSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email address' })
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .trim()
    .min(1, { error: 'Password is required' }),
  fax_number: z
    .string()
    .optional(), // Honeypot field
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  // const isExpired = searchParams.get('expired') === 'true';

  const { login, isLoggingIn, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user || isAuthenticated) {
      router.push(redirect);
    }
  }, [user, isAuthenticated, router, redirect]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
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
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        backendErrors.forEach((e: { field: string; message: string }) => {
          setError(e.field as any, { type: 'manual', message: e.message });
        });
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password.';
        setError('root', { type: 'manual', message: msg });
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
      <div className="w-full max-w-md p-8 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-xl relative overflow-hidden">

        {/* Glow effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Log in to manage your procurement tenders
          </p>
        </div>

        {/* {isExpired && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-xs font-medium text-center">
            Your session has expired. Please log in again.
          </div>
        )} */}

        {errors.root && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" noValidate>
          {/* Honeypot field (hidden from sight, kept in DOM for screen readers and spam bots) */}
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Email Address
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-[var(--border)]'
                }`}
              placeholder="name@company.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Password
            </label>
            <input
              type="password"
              className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-[var(--border)]'
                }`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.password.message}
              </span>
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
            className="w-full py-3.5 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--muted)] relative z-10">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-[#003EC7] hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}