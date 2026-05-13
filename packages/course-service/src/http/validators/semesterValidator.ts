import { z } from 'zod';

export const createSemesterSchema = z.object({
  title: z.string().min(1).max(200),
});

export const updateSemesterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});
