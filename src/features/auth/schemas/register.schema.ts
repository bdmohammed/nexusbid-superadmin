import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(120, { message: 'Name must not exceed 120 characters' }),

    email: z
      .email({ message: 'Please enter a valid email address' })
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),

    confirmPassword: z.string().trim(),

    companyName: z
      .string()
      .trim()
      .min(2, { message: 'Company name must be at least 2 characters' })
      .max(160, { message: 'Company name must not exceed 160 characters' }),

    countryId: z.string().trim().min(1, { message: 'Please select a country' }),

    secondary_website: z.string().optional(),

    terms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
