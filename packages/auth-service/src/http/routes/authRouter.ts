import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const authRouter = Router();

authRouter.post('/auth/register',              container.authController.register);
authRouter.post('/auth/logout',                authenticate(), authorize('student', 'admin', 'super_admin'), container.authController.logout);
authRouter.post('/auth/password-reset',        container.authController.passwordReset);
authRouter.post('/auth/password-reset/verify', container.authController.verifyOtpAndReset);
authRouter.post('/auth/track-failure',         container.authController.trackFailure);
