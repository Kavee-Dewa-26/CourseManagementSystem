import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName:       z.string().min(1).max(100).optional(),
  lastName:        z.string().min(1).max(100).optional(),
  profilePhotoUrl: z.string().url().nullable().optional(),
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
