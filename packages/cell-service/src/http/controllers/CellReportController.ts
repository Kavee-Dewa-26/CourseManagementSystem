import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError }                     from '@shared/errors';
import { sendSuccess, sendPaginated }       from '@shared/response';
import { FileReportUseCase }                from '../../application/use-cases/FileReportUseCase';
import { GetReportsUseCase }                from '../../application/use-cases/GetReportsUseCase';
import { GetReportByIdUseCase }             from '../../application/use-cases/GetReportByIdUseCase';
import { VoidReportUseCase }                from '../../application/use-cases/VoidReportUseCase';
import { fileReportSchema, voidReportSchema, listReportsSchema } from '../validators/reportValidator';
import { CellType } from '../../domain/entities/CellGroup';

export class CellReportController {
  constructor(
    private readonly fileUC:      FileReportUseCase,
    private readonly getReportsUC: GetReportsUseCase,
    private readonly getOneUC:    GetReportByIdUseCase,
    private readonly voidUC:      VoidReportUseCase,
  ) {}

  listReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listReportsSchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));
      const { uid, roles } = (req as AuthenticatedRequest).principal;
      const result = await this.getReportsUC.execute(req.params.id, parsed.data, uid, roles);
      sendPaginated(res, result.items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };

  fileReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // clientReqId comes from X-Idempotency-Key header
      const clientReqId = (req.headers['x-idempotency-key'] ?? '') as string;
      const body        = { ...req.body as Record<string, unknown>, clientReqId };

      const parsed = fileReportSchema.safeParse(body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid, roles } = (req as AuthenticatedRequest).principal;
      const requestId      = (req.headers['x-request-id'] as string) ?? '';

      const { report, isNew } = await this.fileUC.execute(
        req.params.id,
        { ...parsed.data, cellType: (parsed.data.cellType ?? 'g12') as CellType },
        uid,
        roles,
        requestId,
      );

      sendSuccess(res, report, isNew ? 201 : 200);
    } catch (err) { next(err); }
  };

  getReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { uid, roles } = (req as AuthenticatedRequest).principal;
      const report = await this.getOneUC.execute(req.params.id, req.params.rid, uid, roles);
      sendSuccess(res, report);
    } catch (err) { next(err); }
  };

  voidReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = voidReportSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));
      const { uid, roles } = (req as AuthenticatedRequest).principal;
      const requestId      = (req.headers['x-request-id'] as string) ?? '';
      const report = await this.voidUC.execute(req.params.id, req.params.rid, parsed.data.reason, uid, roles, requestId);
      sendSuccess(res, report);
    } catch (err) { next(err); }
  };
}
