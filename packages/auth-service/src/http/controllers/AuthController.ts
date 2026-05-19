import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError }                     from '@shared/errors';
import { sendSuccess }                      from '@shared/response';
import { RegisterUseCase }                  from '../../application/use-cases/RegisterUseCase';
import { LogoutUseCase }                    from '../../application/use-cases/LogoutUseCase';
import { TrackLoginAttemptsUseCase }        from '../../application/use-cases/TrackLoginAttemptsUseCase';
import { RequestPasswordResetUseCase }      from '../../application/use-cases/RequestPasswordResetUseCase';
import { VerifyOtpAndResetUseCase }         from '../../application/use-cases/VerifyOtpAndResetUseCase';
import { FederatedSignInUseCase, FederatedProvider } from '../../application/use-cases/FederatedSignInUseCase';
import {
  registerSchema, passwordResetSchema, verifyOtpSchema, trackFailureSchema,
  federatedSignInSchema, verifyTokenInternalSchema,
} from '../validators/authValidator';

export class AuthController {
  constructor(
    private readonly registerUseCase:        RegisterUseCase,
    private readonly logoutUseCase:          LogoutUseCase,
    private readonly trackAttemptsUseCase:   TrackLoginAttemptsUseCase,
    private readonly requestResetUseCase:    RequestPasswordResetUseCase,
    private readonly verifyOtpUseCase:       VerifyOtpAndResetUseCase,
    private readonly federatedSignInUseCase: FederatedSignInUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const { uid } = await this.registerUseCase.execute(parsed.data, requestId);
      sendSuccess(res, { uid, message: 'Registration successful. You are now an active member.' }, 201);
    } catch (err) { next(err); }
  };

  federatedSignIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const provider  = req.params.provider as FederatedProvider;
      if (provider !== 'google' && provider !== 'apple') {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Provider must be "google" or "apple".' } });
        return;
      }
      const parsed = federatedSignInSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const result    = await this.federatedSignInUseCase.execute(
        provider, parsed.data.idToken, parsed.data.preferredLanguage, requestId,
      );
      sendSuccess(res, result);
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

  // Internal — used by user-service to verify federated tokens for provider linking
  verifyFederatedToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = verifyTokenInternalSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const payload = await this.federatedSignInUseCase.verifyToken(
        parsed.data.provider, parsed.data.idToken,
      );
      sendSuccess(res, payload);
    } catch (err) { next(err); }
  };
}
