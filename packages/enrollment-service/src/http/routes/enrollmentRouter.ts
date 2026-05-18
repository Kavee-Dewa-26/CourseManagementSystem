import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';

export const enrollmentRouter = Router();

// Student — V1 paths (kept for backward compat) + V2 aliases
enrollmentRouter.post('/courses/:id/enroll',        authenticate(), authorize('student'), container.enrollmentController.enroll);
enrollmentRouter.get( '/me/enrollments',            authenticate(), authorize('student'), container.enrollmentController.myEnrollments);
enrollmentRouter.get( '/enrollments/mine',          authenticate(), authorize('student'), container.enrollmentController.myEnrollments);   // V2 alias
enrollmentRouter.post('/enrollments',               authenticate(), authorize('student'), container.enrollmentController.enrollV2);            // V2 alias
enrollmentRouter.post('/enrollments/:id/withdraw',  authenticate(), authorize('student'), container.enrollmentController.withdraw);

// Admin — registrations
enrollmentRouter.get( '/admin/registrations',              authenticate(), authorize('admin'), container.registrationController.list);
enrollmentRouter.post('/admin/registrations/bulk-approve', authenticate(), authorize('admin'), container.registrationController.bulkApprove);
enrollmentRouter.post('/admin/registrations/:id/approve',  authenticate(), authorize('admin'), container.registrationController.approve);
enrollmentRouter.post('/admin/registrations/:id/reject',   authenticate(), authorize('admin'), container.registrationController.reject);

// Admin — enrollments (V1 paths kept + V2 aliases without /admin prefix)
enrollmentRouter.get( '/admin/enrollments',              authenticate(), authorize('admin'), container.enrollmentController.listAdmin);
enrollmentRouter.get( '/enrollments',                    authenticate(), authorize('admin'), container.enrollmentController.listAdmin);          // V2 alias
enrollmentRouter.post('/admin/enrollments/:id/approve',  authenticate(), authorize('admin'), container.enrollmentController.approveAdmin);
enrollmentRouter.post('/enrollments/:id/approve',        authenticate(), authorize('admin'), container.enrollmentController.approveAdmin);       // V2 alias
enrollmentRouter.post('/admin/enrollments/:id/reject',   authenticate(), authorize('admin'), container.enrollmentController.rejectAdmin);
enrollmentRouter.post('/enrollments/:id/reject',         authenticate(), authorize('admin'), container.enrollmentController.rejectAdmin);        // V2 alias

// Role Requests — V2 (member requests student role)
enrollmentRouter.post('/role-requests',              authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.roleRequestController.create);
enrollmentRouter.get( '/role-requests/mine',         authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.roleRequestController.mine);
enrollmentRouter.get( '/role-requests',              authenticate(), authorize('admin'), container.roleRequestController.list);
enrollmentRouter.get( '/role-requests/:id',          authenticate(), authorize('admin', 'super_admin'), container.roleRequestController.getOne);
enrollmentRouter.post('/role-requests/:id/approve',  authenticate(), authorize('admin'), container.roleRequestController.approve);
enrollmentRouter.post('/role-requests/:id/reject',   authenticate(), authorize('admin'), container.roleRequestController.reject);
