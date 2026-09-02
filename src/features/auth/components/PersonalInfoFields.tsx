'use client';

import { useFormContext } from 'react-hook-form';

import type { RegisterFormValues } from '../schemas/register.schema';

export function PersonalInfoFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="name-input"
          className="block text-xs font-semibold uppercase tracking-wider text-(--muted) mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name-input"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={`w-full px-4 py-3 rounded-lg bg-(--surface-secondary) border text-(--foreground) placeholder-(--muted) focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
            errors.name ? 'border-red-500' : 'border-border'
          }`}
          placeholder="John Doe"
          {...register('name')}
        />
        {errors.name && (
          <span id="name-error" className="text-xs text-red-500 mt-1 block">
            {errors.name.message}
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor="email-input"
          className="block text-xs font-semibold uppercase tracking-wider text-(--muted) mb-2"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email-input"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`w-full px-4 py-3 rounded-lg bg-(--surface-secondary) border text-(--foreground) placeholder-(--muted) focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
            errors.email ? 'border-red-500' : 'border-border'
          }`}
          placeholder="name@company.com"
          {...register('email')}
        />
        {errors.email && (
          <span id="email-error" className="text-xs text-red-500 mt-1 block">
            {errors.email.message}
          </span>
        )}
      </div>
    </div>
  );
}
