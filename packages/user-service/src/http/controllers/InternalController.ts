import { Request, Response, NextFunction } from 'express';
import { fromZodError }                    from '@shared/errors';
import { sendSuccess }                     from '@shared/response';
import { CheckEmailExistsUseCase }         from '../../application/use-cases/CheckEmailExistsUseCase';
import { ApproveUserUseCase }              from '../../application/use-cases/ApproveUserUseCase';
import { GetUsersUseCase }                 from '../../application/use-cases/GetUsersUseCase';
import { checkEmailSchema, approveUserSchema } from '../validators/internalValidator';

export class InternalController {
  constructor(
    private readonly checkEmail:  CheckEmailExistsUseCase,
    private readonly approveUser: ApproveUserUseCase,
    private readonly getUsers:    GetUsersUseCase,
  ) {}

  exists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = checkEmailSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const result = await this.checkEmail.execute(parsed.data.email);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = approveUserSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      await this.approveUser.execute(parsed.data.uid);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  getAdmins = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getUsers.execute({ limit: 100, role: 'admin' });
      sendSuccess(res, { uids: result.items.map(u => u.uid) });
    } catch (err) { next(err); }
  };
}
