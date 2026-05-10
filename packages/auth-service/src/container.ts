import { OutboxEventPublisher }              from '@shared/events';
import { FirestoreLoginAttemptsRepository } from './infrastructure/repositories/FirestoreLoginAttemptsRepository';
import { UserServiceClient }                from './infrastructure/clients/UserServiceClient';
import { EnrollmentServiceClient }          from './infrastructure/clients/EnrollmentServiceClient';
import { RegisterUseCase }                  from './application/use-cases/RegisterUseCase';
import { LogoutUseCase }                    from './application/use-cases/LogoutUseCase';
import { TrackLoginAttemptsUseCase }        from './application/use-cases/TrackLoginAttemptsUseCase';
import { PasswordResetUseCase }             from './application/use-cases/PasswordResetUseCase';
import { AuthController }                   from './http/controllers/AuthController';

const attemptsRepo     = new FirestoreLoginAttemptsRepository();
const userClient       = new UserServiceClient();
const enrollmentClient = new EnrollmentServiceClient();
const outbox           = new OutboxEventPublisher();

const registerUseCase      = new RegisterUseCase(userClient, enrollmentClient, outbox);
const logoutUseCase        = new LogoutUseCase();
const trackAttemptsUseCase = new TrackLoginAttemptsUseCase(attemptsRepo);
const passwordResetUseCase = new PasswordResetUseCase();

export const container = {
  authController: new AuthController(registerUseCase, logoutUseCase, trackAttemptsUseCase, passwordResetUseCase),
};
