import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useRegister } from '../api/mutations';
import { type RegisterFormValues, registerSchema } from '../schemas/register.schema';

import { getErrorMessage, getValidationErrors } from '@/lib/errors';

export function useRegisterForm() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const registerMutation = useRegister();

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      countryId: '',
      secondary_website: '',
      terms: false,
    },
  });

  const handleSubmit = methods.handleSubmit(async (data: RegisterFormValues) => {
    // 1. Anti-spam honeypot check
    if (data.secondary_website) {
      console.warn('Spam submission blocked via honeypot.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        countryId: data.countryId,
      });

      setSuccessMsg('Registration successful! Please check your email for a verification link.');
    } catch (err: unknown) {
      const backendErrors = getValidationErrors(err);
      if (backendErrors) {
        backendErrors.forEach((e) => {
          const fieldName = e.field === 'country' ? 'countryId' : e.field;
          methods.setError(fieldName as keyof RegisterFormValues, {
            type: 'manual',
            message: e.message,
          });
        });
      } else {
        const msg = getErrorMessage(err) || 'Failed to register account.';
        methods.setError('root', { type: 'manual', message: msg });
      }
    }
  });

  return {
    methods,
    successMsg,
    isSubmitting: registerMutation.isPending,
    handleSubmit,
  };
}
