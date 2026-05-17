import { createHttpError }            from '@shared/errors';
import { OutboxEventPublisher }       from '@shared/events';
import { IRoleRequestRepository }    from '../../domain/repositories/IRoleRequestRepository';
import { UserServiceClient }         from '../../infrastructure/clients/UserServiceClient';
import { RoleRequest }               from '../../domain/entities/RoleRequest';

export class ApproveRoleRequestUseCase {
  constructor(
    private readonly roleRequestRepo: IRoleRequestRepository,
    private readonly userClient:      UserServiceClient,
    private readonly outbox:          OutboxEventPublisher,
  ) {}

  async execute(id: string, decidedByUid: string, note: string | undefined, requestId: string): Promise<RoleRequest> {
    const req = await this.roleRequestRepo.findById(id);
    if (!req) throw createHttpError(404, 'ROLE_REQUEST_NOT_FOUND', 'Role request not found.');

    req.approve(decidedByUid, note); // throws 409 if not pending

    // Grant the role on the user — adds 'student' to roles[] and updates Firebase claims
    await this.userClient.addRole(req.requesterUid, req.requestedRole);

    await this.roleRequestRepo.update(req);

    await this.outbox.publishWithBatch({
      type:      'role.granted',
      payload:   { requesterUid: req.requesterUid, role: req.requestedRole, decidedByUid },
      requestId,
    });

    return req;
  }
}
