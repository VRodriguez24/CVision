import { z } from 'zod';

const email = z.string().trim().email().max(255).toLowerCase();
const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(160),
    email,
    password,
    acceptedTerms: z.literal(true),
    acceptedPrivacy: z.literal(true),
    acceptedAiProcessing: z.literal(true),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20),
  }),
});
