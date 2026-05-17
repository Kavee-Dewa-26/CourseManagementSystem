import { CreateRoleRequestUseCase } from '../../../src/application/use-cases/CreateRoleRequestUseCase';
import { IRoleRequestRepository }   from '../../../src/domain/repositories/IRoleRequestRepository';
import { RoleRequest }              from '../../../src/domain/entities/RoleRequest';
import { OutboxEventPublisher }     from '@shared/events';

const makeRepo = (): jest.Mocked<IRoleRequestRepository> => ({
  findById:              jest.fn(),
  findPendingByRequester: jest.fn(),
  findByRequester:       jest.fn(),
  findAll:               jest.fn(),
  create:                jest.fn(),
  update:                jest.fn(),
});

const makeOutbox = (): jest.Mocked<OutboxEventPublisher> =>
  ({ publishWithBatch: jest.fn() } as unknown as jest.Mocked<OutboxEventPublisher>);

const makePendingRequest = (): RoleRequest =>
  new RoleRequest({
    id: 'req-existing', requesterUid: 'uid-1', requestedRole: 'student',
    status: 'pending', decidedByUid: null, decisionNote: null,
    createdAt: '2026-01-01T00:00:00.000Z', decidedAt: null,
  });

describe('CreateRoleRequestUseCase', () => {
  let repo:    jest.Mocked<IRoleRequestRepository>;
  let outbox:  jest.Mocked<OutboxEventPublisher>;
  let useCase: CreateRoleRequestUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repo    = makeRepo();
    outbox  = makeOutbox();
    useCase = new CreateRoleRequestUseCase(repo, outbox);
  });

  it('creates a pending role request and publishes role.requested event', async () => {
    repo.findPendingByRequester.mockResolvedValue(null);
    repo.create.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    const result = await useCase.execute('uid-1', 'req-1');

    expect(result.requesterUid).toBe('uid-1');
    expect(result.requestedRole).toBe('student');
    expect(result.status).toBe('pending');
    expect(result.id).toBeDefined();
    expect(repo.create).toHaveBeenCalledWith(result);
    expect(outbox.publishWithBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type:    'role.requested',
        payload: expect.objectContaining({ requesterUid: 'uid-1', requestedRole: 'student' }),
      }),
    );
  });

  it('throws 409 ROLE_REQUEST_PENDING when a pending request already exists', async () => {
    repo.findPendingByRequester.mockResolvedValue(makePendingRequest());

    await expect(useCase.execute('uid-1', 'req-1')).rejects.toMatchObject({
      status:    409,
      errorCode: 'ROLE_REQUEST_PENDING',
    });
    expect(repo.create).not.toHaveBeenCalled();
    expect(outbox.publishWithBatch).not.toHaveBeenCalled();
  });

  it('checks for existing pending request using the requester UID', async () => {
    repo.findPendingByRequester.mockResolvedValue(null);
    repo.create.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    await useCase.execute('uid-42', 'req-x');

    expect(repo.findPendingByRequester).toHaveBeenCalledWith('uid-42');
  });

  it('returns a RoleRequest with a generated UUID id', async () => {
    repo.findPendingByRequester.mockResolvedValue(null);
    repo.create.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    const r1 = await useCase.execute('uid-1', 'req-1');
    const r2 = await useCase.execute('uid-2', 'req-2');

    expect(r1.id).not.toBe(r2.id);
  });
});
