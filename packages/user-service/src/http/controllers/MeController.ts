import { Request, Response, NextFunction }         from 'express';
import { AuthenticatedRequest }                     from '@shared/auth-middleware';
import { fromZodError }                             from '@shared/errors';
import { sendSuccess }                              from '@shared/response';
import { GetMeUseCase }                             from '../../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase }                     from '../../application/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase }                    from '../../application/use-cases/ChangePasswordUseCase';
import { updateProfileSchema, changePasswordSchema } from '../validators/meValidator';

export class MeController {
  constructor(
    private readonly getMe:          GetMeUseCase,
    private readonly updateProfile:  UpdateProfileUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { uid } = (req as AuthenticatedRequest).principal;
      const user    = await this.getMe.execute(uid);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };

  patchProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      const user    = await this.updateProfile.execute({ uid, ...parsed.data });
      sendSuccess(res, user);
    } catch (err) { next(err); }
  };

  postChangePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      await this.changePassword.execute({ uid, ...parsed.data });
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
