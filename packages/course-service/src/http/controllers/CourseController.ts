import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError }                     from '@shared/errors';
import { sendSuccess, sendPaginated }       from '@shared/response';
import { CreateCourseUseCase }              from '../../application/use-cases/CreateCourseUseCase';
import { UpdateCourseUseCase }              from '../../application/use-cases/UpdateCourseUseCase';
import { GetCourseUseCase }                 from '../../application/use-cases/GetCourseUseCase';
import { PublishCourseUseCase }             from '../../application/use-cases/PublishCourseUseCase';
import { UnpublishCourseUseCase }           from '../../application/use-cases/UnpublishCourseUseCase';
import { ArchiveCourseUseCase }             from '../../application/use-cases/ArchiveCourseUseCase';
import { DeleteCourseUseCase }              from '../../application/use-cases/DeleteCourseUseCase';
import { ICourseRepository }               from '../../domain/repositories/ICourseRepository';
import { createCourseSchema, updateCourseSchema, listCoursesSchema } from '../validators/courseValidator';

export class CourseController {
  constructor(
    private readonly courseRepo:    ICourseRepository,
    private readonly createUseCase: CreateCourseUseCase,
    private readonly updateUseCase: UpdateCourseUseCase,
    private readonly getUseCase:    GetCourseUseCase,
    private readonly publishUseCase:   PublishCourseUseCase,
    private readonly unpublishUseCase: UnpublishCourseUseCase,
    private readonly archiveUseCase:   ArchiveCourseUseCase,
    private readonly deleteUseCase:    DeleteCourseUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listCoursesSchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const principal = (req as AuthenticatedRequest).principal;
      const isAdmin   = principal?.roles?.some(r => r === 'admin' || r === 'super_admin') ?? false;

      let result;
      if (isAdmin) {
        result = await this.courseRepo.findAll({ limit: parsed.data.limit, cursor: parsed.data.cursor, state: parsed.data.state });
      } else {
        result = await this.courseRepo.findPublished({ limit: parsed.data.limit, cursor: parsed.data.cursor });
      }

      sendPaginated(res, result.items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const principal = (req as AuthenticatedRequest).principal;
      const isAdmin   = principal?.roles?.some(r => r === 'admin' || r === 'super_admin') ?? false;
      const course    = await this.getUseCase.execute(req.params.id, isAdmin);
      sendSuccess(res, course);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createCourseSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      const course  = await this.createUseCase.execute({ ...parsed.data, createdBy: uid });
      sendSuccess(res, course, 201);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateCourseSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const course = await this.updateUseCase.execute({ id: req.params.id, ...parsed.data });
      sendSuccess(res, course);
    } catch (err) { next(err); }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const course    = await this.publishUseCase.execute(req.params.id, requestId);
      sendSuccess(res, course);
    } catch (err) { next(err); }
  };

  unpublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.unpublishUseCase.execute(req.params.id);
      sendSuccess(res, course);
    } catch (err) { next(err); }
  };

  archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.archiveUseCase.execute(req.params.id);
      sendSuccess(res, course);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
