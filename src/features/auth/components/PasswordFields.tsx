'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { RegisterFormValues } from '../schemas/register.schema';

export function PasswordFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="password-input"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
        >
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`w-full pl-4 pr-11 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
              errors.password ? 'border-red-500' : 'border-[var(--border)]'
            }`}
            placeholder="Enter Password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-hidden"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className="text-xs text-red-500 mt-1 block">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor="confirm-password-input"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
        >
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="confirm-password-input"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            className={`w-full pl-4 pr-11 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
              errors.confirmPassword ? 'border-red-500' : 'border-[var(--border)]'
            }`}
            placeholder="Confirm Password"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showConfirmPassword}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-hidden"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span id="confirm-password-error" className="text-xs text-red-500 mt-1 block">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>
    </div>
  );
}
