import { AdminCreatedHandler }    from '../../../src/application/handlers/AdminCreatedHandler';
import { NotificationDispatcher } from '../../../src/application/services/NotificationDispatcher';

const makeDispatcher = (): jest.Mocked<NotificationDispatcher> =>
  ({ dispatchEmail: jest.fn(), dispatchPush: jest.fn() } as unknown as jest.Mocked<NotificationDispatcher>);

describe('AdminCreatedHandler', () => {
  let dispatcher: jest.Mocked<NotificationDispatcher>;
  let handler:    AdminCreatedHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatcher = makeDispatcher();
    handler    = new AdminCreatedHandler(dispatcher);
  });

  it('sends promotion email with promoted subject when promoted=true', async () => {
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle({ uid: 'uid-1', email: 'u@example.com', firstName: 'Alice', lastName: 'Smith', promoted: true }, 'req-1');

    expect(dispatcher.dispatchEmail).toHaveBeenCalledWith(
      'u@example.com',
      expect.stringContaining('promoted to Admin'),
      expect.stringContaining('promoted'),
      'req-1',
    );
  });

  it('sends account creation email when promoted=false', async () => {
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle({ uid: 'uid-1', email: 'u@example.com', firstName: 'Bob', lastName: 'Jones', promoted: false }, 'req-1');

    expect(dispatcher.dispatchEmail).toHaveBeenCalledWith(
      'u@example.com',
      expect.stringContaining('Admin Account has been Created'),
      expect.any(String),
      'req-1',
    );
  });

  it('sends account creation email when promoted is undefined', async () => {
    dispatcher.dispatchEmail.mockResolvedValue(undefined);

    await handler.handle({ uid: 'uid-1', email: 'u@example.com', firstName: 'Carol', lastName: 'Lee' }, 'req-1');

    expect(dispatcher.dispatchEmail).toHaveBeenCalledWith(
      'u@example.com',
      expect.stringContaining('Admin Account has been Created'),
      expect.any(String),
      'req-1',
    );
  });

  it('propagates errors from dispatchEmail', async () => {
    dispatcher.dispatchEmail.mockRejectedValue(new Error('Email error'));
    await expect(handler.handle({ uid: 'uid-1', email: 'u@example.com', firstName: 'X', lastName: 'Y', promoted: true }, 'req-1')).rejects.toThrow('Email error');
  });
});
