import { z } from 'zod';

export const checkEmailSchema = z.object({
  email: z.string().email(),
});

export const approveUserSchema = z.object({
  uid: z.string().min(1),
});
