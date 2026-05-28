import { z } from 'zod';

export const createCvSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(160),
    snapshot: z.object({}).passthrough(),
  }),
});
