import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const semesterRouter = Router();

semesterRouter.patch( '/semesters/:id',           authenticate(), authorize('admin'), container.semesterController.update);
semesterRouter.delete('/semesters/:id',           authenticate(), authorize('admin'), container.semesterController.remove);
semesterRouter.post(  '/semesters/:id/subjects',  authenticate(), authorize('admin'), container.subjectController.create);
