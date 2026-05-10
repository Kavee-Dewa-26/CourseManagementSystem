import { z } from 'zod';

export const createSubjectSchema = z.object({
  title:          z.string().min(1).max(200),
  description:    z.string().max(2000).optional().default(''),
  youtubeVideoId: z.string().nullable().optional().default(null),
  attachmentIds:  z.array(z.string()).optional().default([]),
});

export const updateSubjectSchema = z.object({
  title:          z.string().min(1).max(200).optional(),
  description:    z.string().min(1).max(2000).optional(),
  youtubeVideoId: z.string().nullable().optional(),
  attachmentIds:  z.array(z.string()).optional(),
});
