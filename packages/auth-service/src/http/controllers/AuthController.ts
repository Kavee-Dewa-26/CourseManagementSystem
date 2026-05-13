import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError }                     from '@shared/errors';
import { sendSuccess }                      from '@shared/response';
import { RegisterUseCase }                from '../../application/use-cases/RegisterUseCase';
import { LogoutUseCase }                  from '../../application/use-cases/LogoutUseCase';
import { TrackLoginAttemptsUseCase }      from '../../application/use-cases/TrackLoginAttemptsUseCase';
import { RequestPasswordResetUseCase }    from '../../application/use-cases/RequestPasswordResetUseCase';
import { VerifyOtpAndResetUseCase }       from '../../application/use-cases/VerifyOtpAndResetUseCase';
import { registerSchema, passwordResetSchema, verifyOtpSchema, trackFailureSchema } from '../validators/authValidator';

export class AuthController {
  constructor(
    private readonly registerUseCase:      RegisterUseCase,
    private readonly logoutUseCase:        LogoutUseCase,
    private readonly trackAttemptsUseCase: TrackLoginAttemptsUseCase,
    private readonly requestResetUseCase:  RequestPasswordResetUseCase,
    private readonly verifyOtpUseCase:     VerifyOtpAndResetUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const requestId = (req.headers['x-request-id'] as string) ?? '';
      await this.registerUseCase.execute(parsed.data, requestId);
      sendSuccess(res, { message: 'Registration submitted. Your account is pending approval.' }, 201);
    } catch (err) { next(err); }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { uid } = (req as AuthenticatedRequest).principal;
      await this.logoutUseCase.execute(uid);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  passwordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = passwordResetSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      await this.requestResetUseCase.execute(parsed.data.email);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  verifyOtpAndReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      await this.verifyOtpUseCase.execute(parsed.data.email, parsed.data.otp);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  trackFailure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = trackFailureSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const result = await this.trackAttemptsUseCase.execute(parsed.data.email);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };
}
