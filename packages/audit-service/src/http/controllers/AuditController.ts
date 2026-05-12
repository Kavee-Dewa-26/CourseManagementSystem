import { Request, Response, NextFunction } from 'express';
import { fromZodError }                     from '@shared/errors';
import { sendPaginated }                    from '@shared/response';
import { IAuditRepository, AuditLogDTO }   from '../../domain/repositories/IAuditRepository';
import { auditQuerySchema }                 from '../validators/auditValidator';

export class AuditController {
  constructor(private readonly auditRepo: IAuditRepository) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = auditQuerySchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));
      const result = await this.auditRepo.findAll(parsed.data);
      const items: AuditLogDTO[] = result.items.map(entry => ({
        id:         entry.id,
        when:       entry.createdAt,
        actor:      { uid: entry.actorUid, email: entry.actorEmail },
        action:     entry.action,
        category:   entry.category,
        ip:         entry.ip,
        targetType: entry.targetType,
        targetId:   entry.targetId,
        requestId:  entry.requestId,
      }));
      sendPaginated(res, items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };
}
