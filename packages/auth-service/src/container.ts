import { OutboxEventPublisher }              from '@shared/events';
import { FirestoreLoginAttemptsRepository } from './infrastructure/repositories/FirestoreLoginAttemptsRepository';
import { FirestoreOtpRepository }           from './infrastructure/repositories/FirestoreOtpRepository';
import { EmailClient }                      from './infrastructure/clients/EmailClient';
import { UserServiceClient }                from './infrastructure/clients/UserServiceClient';
import { EnrollmentServiceClient }          from './infrastructure/clients/EnrollmentServiceClient';
import { RegisterUseCase }                  from './application/use-cases/RegisterUseCase';
import { LogoutUseCase }                    from './application/use-cases/LogoutUseCase';
import { TrackLoginAttemptsUseCase }        from './application/use-cases/TrackLoginAttemptsUseCase';
import { RequestPasswordResetUseCase }      from './application/use-cases/RequestPasswordResetUseCase';
import { VerifyOtpAndResetUseCase }         from './application/use-cases/VerifyOtpAndResetUseCase';
import { AuthController }                   from './http/controllers/AuthController';

const attemptsRepo     = new FirestoreLoginAttemptsRepository();
const otpRepo          = new FirestoreOtpRepository();
const emailClient      = new EmailClient();
const userClient       = new UserServiceClient();
const enrollmentClient = new EnrollmentServiceClient();
const outbox           = new OutboxEventPublisher();

const registerUseCase      = new RegisterUseCase(userClient, enrollmentClient, outbox);
const logoutUseCase        = new LogoutUseCase();
const trackAttemptsUseCase = new TrackLoginAttemptsUseCase(attemptsRepo);
const requestResetUseCase  = new RequestPasswordResetUseCase(otpRepo, emailClient);
const verifyOtpUseCase     = new VerifyOtpAndResetUseCase(otpRepo);

export const container = {
  authController: new AuthController(registerUseCase, logoutUseCase, trackAttemptsUseCase, requestResetUseCase, verifyOtpUseCase),
};
