import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const notificationRouter = Router();

notificationRouter.get( '/me/notifications',             authenticate(), authorize('student', 'admin', 'super_admin'), container.notificationController.list);
notificationRouter.post('/me/notifications/:id/read',    authenticate(), authorize('student', 'admin', 'super_admin'), container.notificationController.markRead);
notificationRouter.post('/me/notifications/read-all',    authenticate(), authorize('student', 'admin', 'super_admin'), container.notificationController.markAllRead);
