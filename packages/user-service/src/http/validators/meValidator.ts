import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName:         z.string().min(1).max(100).optional(),
  lastName:          z.string().min(1).max(100).optional(),
  profilePhotoUrl:   z.string().url().nullable().optional(),
  phoneNumber:       z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number. Use international format, e.g. +94771234567.')
    .nullable()
    .optional(),
  preferredLanguage: z.enum(['en', 'si', 'ta']).optional(),
});

const passwordRule = z
  .string()
  .min(10, 'Password must be at least 10 characters.')
  .regex(/[A-Z]/,   'Password must contain an uppercase letter.')
  .regex(/[a-z]/,   'Password must contain a lowercase letter.')
  .regex(/[0-9]/,   'Password must contain a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.');

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword:     passwordRule,
});

export const fcmTokenSchema = z.object({
  token: z.string().min(1),
});

export const linkProviderSchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken:  z.string().min(1),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push:  z.boolean().optional(),
}).refine(d => d.email !== undefined || d.push !== undefined, {
  message: 'At least one of email or push must be provided.',
});
