import { Router }                         from 'express';
import { authenticate, authorize }        from '@shared/auth-middleware';
import { container }                      from '../../container';

export const meRouter = Router();

meRouter.get(  '/me',                  authenticate(), authorize('student', 'admin', 'super_admin'), container.meController.getProfile);
meRouter.patch('/me',                  authenticate(), authorize('student', 'admin', 'super_admin'), container.meController.patchProfile);
meRouter.post( '/me/change-password',  authenticate(), authorize('student', 'admin', 'super_admin'), container.meController.postChangePassword);
