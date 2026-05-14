import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const listCoursesSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  state:  z.enum(['draft', 'published', 'archived']).optional(),
});
