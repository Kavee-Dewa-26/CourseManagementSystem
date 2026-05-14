import { z } from 'zod';

export const createLessonSchema = z.object({
  title:          z.string().min(1).max(200),
  description:    z.string().max(2000).default(''),
  youtubeVideoId: z.string().nullable().optional().default(null),
  attachmentIds:  z.array(z.string()).optional().default([]),
});

export const updateLessonSchema = z.object({
  title:          z.string().min(1).max(200).optional(),
  description:    z.string().min(1).max(2000).optional(),
  youtubeVideoId: z.string().nullable().optional(),
  attachmentIds:  z.array(z.string()).optional(),
});
