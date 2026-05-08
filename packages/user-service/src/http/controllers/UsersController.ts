import { Request, Response, NextFunction } from 'express';
import { fromZodError }                    from '@shared/errors';
import { sendSuccess, sendPaginated }      from '@shared/response';
import { GetUsersUseCase }                 from '../../application/use-cases/GetUsersUseCase';
import { GetUserByIdUseCase }              from '../../application/use-cases/GetUserByIdUseCase';
import { SuspendUserUseCase }              from '../../application/use-cases/SuspendUserUseCase';
import { ReactivateUserUseCase }           from '../../application/use-cases/ReactivateUserUseCase';
import { listUsersSchema }                 from '../validators/userValidator';

export class UsersController {
  constructor(
    private readonly getUsersUseCase:     GetUsersUseCase,
    private readonly getUserByIdUseCase:  GetUserByIdUseCase,
    private readonly suspendUserUseCase:  SuspendUserUseCase,
    private readonly reactivateUseCase:   ReactivateUserUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listUsersSchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const result = await this.getUsersUseCase.execute(parsed.data);
      sendPaginated(res, result.items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.uid);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };

  suspend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const user      = await this.suspendUserUseCase.execute(req.params.uid, requestId);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };

  reactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.reactivateUseCase.execute(req.params.uid);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };
}
