import { z } from 'zod';

/** Iraq-focused E.164: +9647XXXXXXXXX (or general + and 8–15 digits). */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^\+[1-9]\d{7,14}$/.test(v), {
    message: 'Enter a valid phone number with country code (e.g. +9647XXXXXXXXX)',
  });

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'Enter the 6-digit code' });

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(80, { message: 'Name is too long' });

export const phoneFormSchema = z.object({
  phone: phoneSchema,
});

export const otpFormSchema = z.object({
  code: otpSchema,
});

export const profileFormSchema = z.object({
  displayName: displayNameSchema,
  governorateId: z.string().min(1, { message: 'Select a governorate' }),
  cityId: z.string().min(1, { message: 'Select a city' }),
  preferredLanguage: z.enum(['', 'ar', 'ku', 'en']),
  email: z.union([z.literal(''), z.string().trim().email({ message: 'Enter a valid email' })]),
  dateOfBirth: z.union([
    z.literal(''),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use YYYY-MM-DD' }),
  ]),
  avatarUrl: z.union([
    z.literal(''),
    z.string().trim().url({ message: 'Enter a valid URL' }),
  ]),
});

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
export type OtpFormValues = z.infer<typeof otpFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
