import { createHttpError }         from '@shared/errors';
import { OutboxEventPublisher }    from '@shared/events';
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository';
import { UserServiceClient }       from '../../infrastructure/clients/UserServiceClient';
import { Registration }            from '../../domain/entities/Registration';

export class ApproveRegistrationUseCase {
  constructor(
    private readonly regRepo:     IRegistrationRepository,
    private readonly userClient:  UserServiceClient,
    private readonly outbox:      OutboxEventPublisher,
  ) {}

  async execute(id: string, requestId: string): Promise<Registration> {
    const reg = await this.regRepo.findById(id);
    if (!reg) throw createHttpError(404, 'ENROLLMENT_NOT_FOUND', 'Registration not found.');

    reg.approve();
    await this.userClient.approveUser(reg.studentUid);
    await this.regRepo.update(reg);

    await this.outbox.publishWithBatch({
      type:      'registration.approved',
      payload:   { studentUid: reg.studentUid, email: reg.email },
      requestId,
    });

    return reg;
  }
}
