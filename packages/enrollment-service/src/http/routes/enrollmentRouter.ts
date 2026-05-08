import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const enrollmentRouter = Router();

// Student
enrollmentRouter.post('/courses/:id/enroll',        authenticate(), authorize('student'), container.enrollmentController.enroll);
enrollmentRouter.get( '/me/enrollments',            authenticate(), authorize('student'), container.enrollmentController.myEnrollments);
enrollmentRouter.post('/enrollments/:id/withdraw',  authenticate(), authorize('student'), container.enrollmentController.withdraw);

// Admin — registrations
enrollmentRouter.get( '/admin/registrations',              authenticate(), authorize('admin'), container.registrationController.list);
enrollmentRouter.post('/admin/registrations/bulk-approve', authenticate(), authorize('admin'), container.registrationController.bulkApprove);
enrollmentRouter.post('/admin/registrations/:id/approve',  authenticate(), authorize('admin'), container.registrationController.approve);
enrollmentRouter.post('/admin/registrations/:id/reject',   authenticate(), authorize('admin'), container.registrationController.reject);

// Admin — enrollments
enrollmentRouter.get( '/admin/enrollments',              authenticate(), authorize('admin'), container.enrollmentController.listAdmin);
enrollmentRouter.post('/admin/enrollments/:id/approve',  authenticate(), authorize('admin'), container.enrollmentController.approveAdmin);
enrollmentRouter.post('/admin/enrollments/:id/reject',   authenticate(), authorize('admin'), container.enrollmentController.rejectAdmin);
