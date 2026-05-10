import { z } from 'zod';

export const createSemesterSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
});

export const updateSemesterSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
});
