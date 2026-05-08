import { OutboxEventPublisher }              from '@shared/events';
import { FirestoreRegistrationRepository }  from './infrastructure/repositories/FirestoreRegistrationRepository';
import { FirestoreEnrollmentRepository }    from './infrastructure/repositories/FirestoreEnrollmentRepository';
import { UserServiceClient }                from './infrastructure/clients/UserServiceClient';
import { CourseServiceClient }              from './infrastructure/clients/CourseServiceClient';
import { CreateRegistrationUseCase }        from './application/use-cases/CreateRegistrationUseCase';
import { ApproveRegistrationUseCase }       from './application/use-cases/ApproveRegistrationUseCase';
import { RejectRegistrationUseCase }        from './application/use-cases/RejectRegistrationUseCase';
import { BulkApproveRegistrationsUseCase }  from './application/use-cases/BulkApproveRegistrationsUseCase';
import { CreateEnrollmentUseCase }          from './application/use-cases/CreateEnrollmentUseCase';
import { ApproveEnrollmentUseCase }         from './application/use-cases/ApproveEnrollmentUseCase';
import { RejectEnrollmentUseCase }          from './application/use-cases/RejectEnrollmentUseCase';
import { WithdrawEnrollmentUseCase }        from './application/use-cases/WithdrawEnrollmentUseCase';
import { RegistrationController }           from './http/controllers/RegistrationController';
import { EnrollmentController }             from './http/controllers/EnrollmentController';
import { InternalEnrollmentController }     from './http/controllers/InternalEnrollmentController';

const regRepo      = new FirestoreRegistrationRepository();
const enrollRepo   = new FirestoreEnrollmentRepository();
const userClient   = new UserServiceClient();
const courseClient = new CourseServiceClient();
const outbox       = new OutboxEventPublisher();

const createReg    = new CreateRegistrationUseCase(regRepo);
const approveReg   = new ApproveRegistrationUseCase(regRepo, userClient, outbox);
const rejectReg    = new RejectRegistrationUseCase(regRepo, outbox);
const bulkApprove  = new BulkApproveRegistrationsUseCase(approveReg);

const createEnroll  = new CreateEnrollmentUseCase(enrollRepo, courseClient, outbox);
const approveEnroll = new ApproveEnrollmentUseCase(enrollRepo, outbox);
const rejectEnroll  = new RejectEnrollmentUseCase(enrollRepo, outbox);
const withdraw      = new WithdrawEnrollmentUseCase(enrollRepo, outbox);

export const container = {
  registrationController:       new RegistrationController(regRepo, approveReg, rejectReg, bulkApprove),
  enrollmentController:         new EnrollmentController(enrollRepo, createEnroll, approveEnroll, rejectEnroll, withdraw),
  internalEnrollmentController: new InternalEnrollmentController(createReg, enrollRepo),
};
