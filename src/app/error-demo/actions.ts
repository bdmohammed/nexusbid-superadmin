// src/app/error-demo/actions.ts
'use server';

import { handleActionError } from '@/lib/errors/utils';
import { ValidationError } from '@/lib/errors/ValidationError';

export async function submitFailingFormAction(formData: { name: string; email: string }) {
  return handleActionError(async () => {
    // Simulate a brief DB lookup delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const errors: Record<string, string[]> = {};
    if (!formData.name || formData.name.length < 3) {
      errors.name = ['Name must be at least 3 characters long'];
    }
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = ['Please provide a valid email address'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Form validation failed', { fieldErrors: errors });
    }

    return { message: 'Action completed successfully!' };
  }, {
    pathname: '/error-demo',
    component: 'submitFailingFormAction',
  });
}

export async function triggerServerActionCrash() {
  return handleActionError(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate a null pointer or database failure
    const config: any = null;
    return config.database.connectionString;
  }, {
    pathname: '/error-demo',
    component: 'triggerServerActionCrash',
  });
}
