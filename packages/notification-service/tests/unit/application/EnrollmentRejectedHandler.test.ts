import { EnrollmentRejectedHandler } from '../../../src/application/handlers/EnrollmentRejectedHandler';
import { INotificationRepository }  from '../../../src/domain/repositories/INotificationRepository';
import { NotificationDispatcher }   from '../../../src/application/services/NotificationDispatcher';

const makeRepo = (): jest.Mocked<INotificationRepository> =>
  ({ findByUser: jest.fn(), create: jest.fn(), markRead: jest.fn(), markAllRead: jest.fn() });

const makeDispatcher = (): jest.Mocked<NotificationDispatcher> =>
  ({ dispatchEmail: jest.fn(), dispatchPush: jest.fn() } as unknown as jest.Mocked<NotificationDispatcher>);

describe('EnrollmentRejectedHandler', () => {
  let repo:       jest.Mocked<INotificationRepository>;
  let dispatcher: jest.Mocked<NotificationDispatcher>;
  let handler:    EnrollmentRejectedHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    repo       = makeRepo();
    dispatcher = makeDispatcher();
    handler    = new EnrollmentRejectedHandler(repo, dispatcher);
  });

  it('creates in-app notification and sends email when email is provided', async () => {
    repo.create.mockResolvedValue(undefined);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle({ studentUid: 'uid-1', courseId: 'c1', email: 'u@example.com', reason: null }, 'req-1');

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'enrollment.rejected', userUid: 'uid-1' }),
    );
    expect(dispatcher.dispatchEmail).toHaveBeenCalledTimes(1);
  });

  it('does not send email when email is absent', async () => {
    repo.create.mockResolvedValue(undefined);

    await handler.handle({ studentUid: 'uid-1', courseId: 'c1' }, 'req-1');

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatchEmail).not.toHaveBeenCalled();
  });

  it('includes rejection reason in notification body when reason is provided', async () => {
    repo.create.mockResolvedValue(undefined);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle({ studentUid: 'uid-1', courseId: 'c1', email: 'u@example.com', reason: 'Not enrolled' }, 'req-1');

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.stringContaining('Not enrolled') }),
    );
  });

  it('propagates errors from repo.create', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(handler.handle({ studentUid: 'uid-1', courseId: 'c1' }, 'req-1')).rejects.toThrow('DB error');
  });
});
