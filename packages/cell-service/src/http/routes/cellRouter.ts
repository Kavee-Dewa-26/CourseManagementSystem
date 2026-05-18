import { Router }                  from 'express';
import { authenticate, authorize } from '@shared/auth-middleware';
import { container }               from '../../container';
import { handleReportPhotos }      from '../middleware/reportPhotoUpload';

export const cellRouter = Router();

// ── Cell Groups ───────────────────────────────────────────────────────────────
cellRouter.get( '/cells/mine',  authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.mine);
cellRouter.get( '/cells',       authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.list);
cellRouter.post('/cells',       authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'),                      container.cellGroupController.create);
cellRouter.get( '/cells/:id',   authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.getOne);
cellRouter.patch('/cells/:id',  authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'),                      container.cellGroupController.update);
cellRouter.post('/cells/:id/archive', authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.archive);

// Members
cellRouter.post(  '/cells/:id/members',      authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.addMembers);
cellRouter.delete('/cells/:id/members/:uid', authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'), container.cellGroupController.removeMember);

// Join Requests
cellRouter.post('/cells/:id/join-requests',                authenticate(), authorize('member', 'student'),                        container.cellGroupController.createJoinRequest);
cellRouter.get( '/cells/:id/join-requests',                authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'),    container.cellGroupController.listJoinRequests);
cellRouter.post('/cells/:id/join-requests/:rid/approve',   authenticate(), authorize('admin', 'super_admin'),                     container.cellGroupController.approveJoinRequest);
cellRouter.post('/cells/:id/join-requests/:rid/reject',    authenticate(), authorize('admin', 'super_admin'),                     container.cellGroupController.rejectJoinRequest);

// ── Cell Reports ──────────────────────────────────────────────────────────────
// Photo upload must come before report filing — returns URLs to include in photoUrls[]
cellRouter.post('/cells/:id/report-photos',            authenticate(), authorize('leader', 'g12', 'super_admin'), handleReportPhotos, container.cellReportController.uploadPhotos);
cellRouter.get( '/cells/:id/reports',                  authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.cellReportController.listReports);
cellRouter.post('/cells/:id/reports',                  authenticate(), authorize('leader', 'g12', 'super_admin'),                              container.cellReportController.fileReport);
cellRouter.get( '/cells/:id/reports/:rid',             authenticate(), authorize('member', 'student', 'leader', 'g12', 'admin', 'super_admin'), container.cellReportController.getReport);
cellRouter.post('/cells/:id/reports/:rid/void',        authenticate(), authorize('leader', 'g12', 'admin', 'super_admin'),                     container.cellReportController.voidReport);
