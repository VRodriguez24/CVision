import { z } from 'zod';

const cvSnapshotSchema = z.object({}).passthrough();

export const improveFieldSchema = z.object({
  body: z.object({
    fieldPath: z.string().trim().min(1).max(120),
    fieldLabel: z.string().trim().min(1).max(120),
    text: z.string().max(4000),
    selectedText: z.string().max(4000).optional(),
    targetRole: z.string().trim().max(160).optional(),
    cv: cvSnapshotSchema,
  }),
});

export const analyzeCvSchema = z.object({
  body: z.object({
    targetRole: z.string().trim().min(1).max(160),
    cv: cvSnapshotSchema,
  }),
});
