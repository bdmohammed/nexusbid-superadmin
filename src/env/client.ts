import { z } from 'zod';

const browser = typeof window !== 'undefined';

export const isBrowser = () => browser;

export const isDevEnv = () => process.env.NODE_ENV === 'development';

export const isProdEnv = () => process.env.NODE_ENV === 'production';

export const isTestEnv = () => process.env.NODE_ENV === 'test';

export const clientEnv = z
  .object({
    NEXT_PUBLIC_API_URL: z.url().default('http://localhost:3000/api'),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  });
