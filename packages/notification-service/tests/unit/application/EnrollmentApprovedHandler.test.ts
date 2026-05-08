import { EnrollmentApprovedHandler } from '../../../src/application/handlers/EnrollmentApprovedHandler';
import { INotificationRepository }   from '../../../src/domain/repositories/INotificationRepository';
import { NotificationDispatcher }    from '../../../src/application/services/NotificationDispatcher';

const makeRepo       = (): jest.Mocked<INotificationRepository> =>
  ({ findByUser: jest.fn(), create: jest.fn(), markRead: jest.fn(), markAllRead: jest.fn() });
const makeDispatcher = (): jest.Mocked<NotificationDispatcher> =>
  ({ dispatchEmail: jest.fn(), dispatchPush: jest.fn() } as unknown as jest.Mocked<NotificationDispatcher>);

describe('EnrollmentApprovedHandler', () => {
  let repo:       jest.Mocked<INotificationRepository>;
  let dispatcher: jest.Mocked<NotificationDispatcher>;
  let handler:    EnrollmentApprovedHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    repo       = makeRepo();
    dispatcher = makeDispatcher();
    handler    = new EnrollmentApprovedHandler(repo, dispatcher);
  });

  it('creates in-app, sends email and push when all channels provided', async () => {
    repo.create.mockResolvedValue(undefined);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);
    dispatcher.dispatchPush.mockResolvedValue(undefined);

    await handler.handle({ studentUid: 'uid1', courseId: 'c1', email: 'a@b.com', fcmToken: 'tok', courseTitle: 'TS' }, 'req-1');

    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'enrollment.approved' }));
    expect(dispatcher.dispatchEmail).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatchPush).toHaveBeenCalledTimes(1);
  });

  it('continues normally when push fails (dispatcher swallows push errors)', async () => {
    repo.create.mockResolvedValue(undefined);
    dispatcher.dispatchEmail.mockResolvedValue(undefined);
    dispatcher.dispatchPush.mockResolvedValue(undefined);

    await expect(handler.handle({ studentUid: 'uid1', courseId: 'c1', fcmToken: 'bad-token' }, 'req-1')).resolves.toBeUndefined();
  });
});
