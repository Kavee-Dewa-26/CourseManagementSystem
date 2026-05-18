import { Request, Response, NextFunction } from 'express';
import { getStorage }                       from 'firebase-admin/storage';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError, createHttpError }    from '@shared/errors';
import { sendSuccess, sendPaginated }       from '@shared/response';
import { logger }                           from '@shared/logger';
import { FileReportUseCase }                from '../../application/use-cases/FileReportUseCase';
import { GetReportsUseCase }                from '../../application/use-cases/GetReportsUseCase';
import { GetReportByIdUseCase }             from '../../application/use-cases/GetReportByIdUseCase';
import { VoidReportUseCase }                from '../../application/use-cases/VoidReportUseCase';
import { fileReportSchema, voidReportSchema, listReportsSchema } from '../validators/reportValidator';
import { CellType } from '../../domain/entities/CellGroup';

export class CellReportController {
  constructor(
    private readonly fileUC:       FileReportUseCase,
    private readonly getReportsUC: GetReportsUseCase,
    private readonly getOneUC:     GetReportByIdUseCase,
    private readonly voidUC:       VoidReportUseCase,
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
      const report = await this.voidUC.execute(
        req.params.id, req.params.rid, parsed.data.reason, uid, roles, requestId,
      );
      sendSuccess(res, report);
    } catch (err) { next(err); }
  };

  /**
   * POST /cells/:id/report-photos
   * Upload 1–10 meeting photos (JPEG/PNG, max 5 MB each) before filing a report.
   * Returns { photoUrls: string[] } — pass these in photoUrls[] when calling POST /cells/:id/reports.
   */
  uploadPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cellId = req.params.id;
      const files  = (req.files ?? []) as Express.Multer.File[];

      if (files.length === 0)
        return next(createHttpError(400, 'VALIDATION_ERROR', 'No photos provided.'));

      const bucket    = getStorage().bucket();
      const timestamp = Date.now();
      const photoUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const f       = files[i];
        const ext     = f.mimetype === 'image/png' ? 'png' : 'jpg';
        const path    = `cells/${cellId}/report-photos/${timestamp}-${i + 1}.${ext}`;
        const fileRef = bucket.file(path);
        await fileRef.save(f.buffer, { contentType: f.mimetype, resumable: false });
        await fileRef.makePublic();
        photoUrls.push(fileRef.publicUrl());
      }

      logger.info({ cellId, count: photoUrls.length }, 'Cell report photos uploaded');
      sendSuccess(res, { photoUrls }, 201);
    } catch (err) { next(err); }
  };
}
