import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { internalAuth }            from '../middleware/internalAuth';
import { container }               from '../../container';

export const authRouter = Router();

// Public auth
authRouter.post('/auth/register',              container.authController.register);
authRouter.post('/auth/logout',                authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.authController.logout);
authRouter.post('/auth/password-reset',        container.authController.passwordReset);
authRouter.post('/auth/password-reset/verify', container.authController.verifyOtpAndReset);
authRouter.post('/auth/track-failure',         container.authController.trackFailure);

// Federated OAuth — V2
authRouter.post('/auth/federated/:provider',   container.authController.federatedSignIn);

// Internal — used by other services for token verification
authRouter.post('/internal/auth/verify-token', internalAuth, container.authController.verifyFederatedToken);
