import { Request, Response, NextFunction } from 'express';
import { fromZodError }                     from '@shared/errors';
import { sendPaginated }                    from '@shared/response';
import { IAuditRepository }                from '../../domain/repositories/IAuditRepository';
import { auditQuerySchema }                 from '../validators/auditValidator';

export class AuditController {
  constructor(private readonly auditRepo: IAuditRepository) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = auditQuerySchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));
      const result = await this.auditRepo.findAll(parsed.data);
      sendPaginated(res, result.items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };
}
