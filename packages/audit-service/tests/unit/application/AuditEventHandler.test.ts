import { AuditEventHandler }    from '../../../src/application/handlers/AuditEventHandler';
import { IAuditRepository }     from '../../../src/domain/repositories/IAuditRepository';

const makeRepo = (): jest.Mocked<IAuditRepository> =>
  ({ append: jest.fn(), findAll: jest.fn() });

describe('AuditEventHandler', () => {
  let repo:    jest.Mocked<IAuditRepository>;
  let handler: AuditEventHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    repo    = makeRepo();
    handler = new AuditEventHandler(repo);
  });

  it('appends an audit entry with correct fields', async () => {
    repo.append.mockResolvedValue('audit-id-1');

    await handler.handle(
      { action: 'registration.approved', actorUid: 'admin-uid', targetType: 'student', targetId: 'uid-1' },
      'req-1',
    );

    expect(repo.append).toHaveBeenCalledWith(expect.objectContaining({
      action:     'registration.approved',
      actorUid:   'admin-uid',
      targetType: 'student',
      targetId:   'uid-1',
      requestId:  'req-1',
    }));
  });

  it('uses null when actorUid is absent', async () => {
    repo.append.mockResolvedValue('audit-id-2');

    await handler.handle({ action: 'user.registered' }, 'req-2');

    expect(repo.append).toHaveBeenCalledWith(expect.objectContaining({
      actorUid:   null,
      action:     'user.registered',
      targetType: null,
      targetId:   null,
    }));
  });
});
