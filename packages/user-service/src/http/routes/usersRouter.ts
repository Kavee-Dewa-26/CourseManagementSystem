import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const usersRouter = Router();

usersRouter.get( '/users',               authenticate(), authorize('admin'), container.usersController.list);
usersRouter.get( '/users/:uid',          authenticate(), authorize('admin'), container.usersController.getOne);
usersRouter.post( '/users/:uid/suspend',    authenticate(), authorize('admin'), container.usersController.suspend);
usersRouter.post( '/users/:uid/reactivate', authenticate(), authorize('admin'), container.usersController.reactivate);
usersRouter.patch('/users/:uid/roles',      authenticate(), authorize('admin'), container.usersController.assignRole);
