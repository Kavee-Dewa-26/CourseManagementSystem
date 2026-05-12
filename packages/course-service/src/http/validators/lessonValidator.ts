import { z } from 'zod';

export const createLessonSchema = z.object({
  title:       z.string().min(1).max(200),
  url:         z.string().url('Lesson URL must be a valid URL.'),
  description: z.string().max(2000).default(''),
});

export const updateLessonSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  url:         z.string().url('Lesson URL must be a valid URL.').optional(),
  description: z.string().min(1).max(2000).optional(),
});
