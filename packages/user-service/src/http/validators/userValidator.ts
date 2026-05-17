import { z } from 'zod';

export const listUsersSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  role:   z.enum(['student', 'admin', 'super_admin']).optional(),
  status: z.enum(['pending_approval', 'approved', 'rejected', 'suspended']).optional(),
});

export const assignRoleSchema = z.object({
  role:   z.enum(['member', 'student', 'leader', 'g12', 'admin', 'super_admin']),
  action: z.enum(['add', 'remove']),
});
