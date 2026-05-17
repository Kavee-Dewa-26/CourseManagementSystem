import { UserRegisteredHandler }    from '../../../src/application/handlers/UserRegisteredHandler';
import { INotificationRepository } from '../../../src/domain/repositories/INotificationRepository';
import { NotificationDispatcher }  from '../../../src/application/services/NotificationDispatcher';
import { UserServiceClient }       from '../../../src/infrastructure/clients/UserServiceClient';

const makeRepo = (): jest.Mocked<INotificationRepository> =>
  ({ findByUser: jest.fn(), create: jest.fn(), markRead: jest.fn(), markAllRead: jest.fn() });

const makeDispatcher = (): jest.Mocked<NotificationDispatcher> =>
  ({ dispatchEmail: jest.fn(), dispatchPush: jest.fn() } as unknown as jest.Mocked<NotificationDispatcher>);

const makeUserClient = (): jest.Mocked<UserServiceClient> =>
  ({ getAdminUids: jest.fn() } as unknown as jest.Mocked<UserServiceClient>);

const PAYLOAD = { uid: 'uid-1', email: 'student@example.com', firstName: 'Alice', lastName: 'Smith' };

describe('UserRegisteredHandler', () => {
  let repo:       jest.Mocked<INotificationRepository>;
  let dispatcher: jest.Mocked<NotificationDispatcher>;
  let userClient: jest.Mocked<UserServiceClient>;
  let handler:    UserRegisteredHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    repo       = makeRepo();
    dispatcher = makeDispatcher();
    userClient = makeUserClient();
    handler    = new UserRegisteredHandler(repo, userClient, dispatcher);
  });

  it('creates in-app notification for each admin and sends confirmation email', async () => {
    userClient.getAdminUids.mockResolvedValue(['admin-1', 'admin-2']);
    repo.create.mockResolvedValue(undefined);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle(PAYLOAD, 'req-1');

    expect(repo.create).toHaveBeenCalledTimes(2);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'user.registered', userUid: 'admin-1' }));
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'user.registered', userUid: 'admin-2' }));
    expect(dispatcher.dispatchEmail).toHaveBeenCalledWith(
      'student@example.com',
      expect.stringContaining('Registration Received'),
      expect.any(String),
      'req-1',
    );
  });

  it('sends confirmation email to student even when no admins exist', async () => {
    userClient.getAdminUids.mockResolvedValue([]);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle(PAYLOAD, 'req-1');

    expect(repo.create).not.toHaveBeenCalled();
    expect(dispatcher.dispatchEmail).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from userClient.getAdminUids', async () => {
    userClient.getAdminUids.mockRejectedValue(new Error('Client error'));
    await expect(handler.handle(PAYLOAD, 'req-1')).rejects.toThrow('Client error');
  });
});
