import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { tryAuthenticate }         from '../middleware/tryAuthenticate';
import { container }               from '../../container';

export const courseRouter = Router();

// Public / role-aware
courseRouter.get( '/courses',              tryAuthenticate(), container.courseController.list);
courseRouter.get( '/courses/:id',          tryAuthenticate(), container.courseController.getOne);

// Admin
courseRouter.post(  '/courses',                  authenticate(), authorize('admin'), container.courseController.create);
courseRouter.patch( '/courses/:id',              authenticate(), authorize('admin'), container.courseController.update);
courseRouter.post(  '/courses/:id/publish',      authenticate(), authorize('admin'), container.courseController.publish);
courseRouter.post(  '/courses/:id/unpublish',    authenticate(), authorize('admin'), container.courseController.unpublish);
courseRouter.post(  '/courses/:id/archive',      authenticate(), authorize('admin'), container.courseController.archive);
courseRouter.delete('/courses/:id',              authenticate(), authorize('admin'), container.courseController.remove);

// Semesters (under course)
courseRouter.post('/courses/:id/semesters', authenticate(), authorize('admin'), container.semesterController.create);
