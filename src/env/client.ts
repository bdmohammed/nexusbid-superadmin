import { z } from "zod";

export const clientEnv = z
  .object({
    NEXT_PUBLIC_API_URL: z
      .url()
      .default("http://localhost:3000/api"),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  });
