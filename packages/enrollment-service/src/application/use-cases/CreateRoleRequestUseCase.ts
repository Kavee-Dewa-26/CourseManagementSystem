import { v4 as uuidv4 }              from 'uuid';
import { createHttpError }            from '@shared/errors';
import { OutboxEventPublisher }       from '@shared/events';
import { IRoleRequestRepository }    from '../../domain/repositories/IRoleRequestRepository';
import { RoleRequest }               from '../../domain/entities/RoleRequest';

export class CreateRoleRequestUseCase {
  constructor(
    private readonly roleRequestRepo: IRoleRequestRepository,
    private readonly outbox:          OutboxEventPublisher,
  ) {}

  async execute(requesterUid: string, requestId: string): Promise<RoleRequest> {
    // Check for existing pending request
    const existing = await this.roleRequestRepo.findPendingByRequester(requesterUid);
    if (existing) {
      throw createHttpError(409, 'ROLE_REQUEST_PENDING', 'You already have a pending request for this role.');
    }

    const now = new Date().toISOString();
    const req = new RoleRequest({
      id:            uuidv4(),
      requesterUid,
      requestedRole: 'student',
      status:        'pending',
      decidedByUid:  null,
      decisionNote:  null,
      createdAt:     now,
      decidedAt:     null,
    });

    await this.roleRequestRepo.create(req);

    await this.outbox.publishWithBatch({
      type:      'role.requested',
      payload:   { requesterUid, requestedRole: 'student' },
      requestId,
    });

    return req;
  }
}
