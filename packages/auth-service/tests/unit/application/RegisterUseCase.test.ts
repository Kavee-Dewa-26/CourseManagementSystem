import { RegisterUseCase }      from '../../../src/application/use-cases/RegisterUseCase';
import { UserServiceClient }   from '../../../src/infrastructure/clients/UserServiceClient';
import { OutboxEventPublisher } from '@shared/events';

const authMock = {
  createUser:          jest.fn().mockResolvedValue({ uid: 'new-uid' }),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  deleteUser:          jest.fn().mockResolvedValue(undefined),
};
jest.mock('firebase-admin/auth', () => ({ getAuth: () => authMock }));

jest.mock('firebase-admin/firestore', () => {
  const batchMock = { set: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) };
  return {
    getFirestore: () => ({
      batch:      () => batchMock,
      collection: () => ({ doc: () => ({}) }),
    }),
  };
});

const makeClient = (): jest.Mocked<UserServiceClient> =>
  ({ emailExists: jest.fn() } as unknown as jest.Mocked<UserServiceClient>);

const makeOutbox = (): jest.Mocked<OutboxEventPublisher> =>
  ({ publishWithBatch: jest.fn() } as unknown as jest.Mocked<OutboxEventPublisher>);

const INPUT = {
  firstName: 'Viruli', lastName: 'W',
  email: 'viruli@example.com', password: 'SecurePass@2026',
};

describe('RegisterUseCase', () => {
  let client:  jest.Mocked<UserServiceClient>;
  let outbox:  jest.Mocked<OutboxEventPublisher>;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    client  = makeClient();
    outbox  = makeOutbox();
    useCase = new RegisterUseCase(client, outbox);
  });

  it('creates active member and publishes user.registered event', async () => {
    client.emailExists.mockResolvedValue(false);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    await useCase.execute(INPUT, 'req-1');

    expect(client.emailExists).toHaveBeenCalledWith(INPUT.email);
    expect(authMock.setCustomUserClaims).toHaveBeenCalledWith(
      'new-uid',
      { role: 'member', roles: ['member'] },
    );
    expect(outbox.publishWithBatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user.registered' }),
      expect.anything(),
    );
  });

  it('throws 409 EMAIL_EXISTS when email already registered', async () => {
    client.emailExists.mockResolvedValue(true);

    await expect(useCase.execute(INPUT, 'req-1')).rejects.toMatchObject({
      status:    409,
      errorCode: 'EMAIL_EXISTS',
    });
  });

  it('cleans up Firebase Auth user if Firestore write fails', async () => {
    client.emailExists.mockResolvedValue(false);
    outbox.publishWithBatch.mockRejectedValue(new Error('Firestore down'));

    await expect(useCase.execute(INPUT, 'req-1')).rejects.toThrow('Firestore down');
    expect(authMock.deleteUser).toHaveBeenCalledWith('new-uid');
  });
});
