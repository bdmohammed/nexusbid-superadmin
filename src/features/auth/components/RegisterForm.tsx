'use client';

import { AlertCircle } from 'lucide-react';
import { FormProvider } from 'react-hook-form';

import { useRegisterForm } from '../hooks/useRegisterForm';

import { CompanyCountryFields } from './CompanyCountryFields';
import { PasswordFields } from './PasswordFields';
import { PersonalInfoFields } from './PersonalInfoFields';
import { RegistrationSuccess } from './RegistrationSuccess';
import { TermsCheckbox } from './TermsCheckbox';

import { PasswordChecklist } from '@/components/auth/PasswordChecklist';

export function RegisterForm() {
  const { methods, successMsg, isSubmitting, handleSubmit } = useRegisterForm();
  const {
    register,
    formState: { errors },
  } = methods;

  if (successMsg) {
    return <RegistrationSuccess message={successMsg} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10" noValidate>
        {/* Honeypot field for anti-spam */}
        <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="secondary_website">Secondary Website</label>
          <input
            id="secondary_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('secondary_website')}
          />
        </div>

        {errors.root && (
          <div
            role="alert"
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <PersonalInfoFields />
        <CompanyCountryFields />
        <PasswordFields />
        <PasswordChecklist />
        <TermsCheckbox />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </FormProvider>
  );
}
