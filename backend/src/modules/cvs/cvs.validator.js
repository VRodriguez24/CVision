import { z } from 'zod';

export const createCvSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(160),
    snapshot: z.object({}).passthrough(),
  }),
});

export const cvIdParamSchema = z.object({
  params: z.object({
    cvId: z.string().uuid(),
  }),
});

export const updateCvSchema = z.object({
  params: z.object({
    cvId: z.string().uuid(),
  }),
  body: z.object({
    snapshot: z.object({}).passthrough(),
  }),
});

export const renameCvSchema = z.object({
  params: z.object({
    cvId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(160),
  }),
});
