'use client';

import { Controller, useFormContext } from 'react-hook-form';

import type { RegisterFormValues } from '../schemas/register.schema';
import CountryDropdown from '@/components/auth/CountryDropdown';

export function CompanyCountryFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegisterFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="company-input"
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
        >
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          id="company-input"
          type="text"
          autoComplete="organization"
          aria-invalid={!!errors.companyName}
          aria-describedby={errors.companyName ? 'company-error' : undefined}
          className={`w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all ${
            errors.companyName ? 'border-red-500' : 'border-[var(--border)]'
          }`}
          placeholder="Acme Corp"
          {...register('companyName')}
        />
        {errors.companyName && (
          <span id="company-error" className="text-xs text-red-500 mt-1 block">
            {errors.companyName.message}
          </span>
        )}
      </div>

      <div>
        <Controller
          name="countryId"
          control={control}
          render={({ field }) => (
            <CountryDropdown
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.countryId?.message}
            />
          )}
        />
      </div>
    </div>
  );
}
