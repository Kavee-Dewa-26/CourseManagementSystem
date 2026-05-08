import { CreateAdminUseCase, CreateAdminInput } from '../../../src/application/use-cases/CreateAdminUseCase';
import { IUserRepository }                      from '../../../src/domain/repositories/IUserRepository';
import { FirebaseAuthClient }                   from '../../../src/infrastructure/clients/FirebaseAuthClient';
import { OutboxEventPublisher }                 from '@shared/events';
import { User }                                 from '../../../src/domain/entities/User';

const makeUser = (overrides = {}): User =>
  new User({
    uid: 'uid-1', email: 'admin@example.com', firstName: 'Kavinda',
    lastName: 'Perera', role: 'admin', status: 'approved',
    profilePhotoUrl: null, createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z', deletedAt: null, ...overrides,
  });

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  findAll:     jest.fn(),
  create:      jest.fn(),
  update:      jest.fn(),
  softDelete:  jest.fn(),
});

const makeAuthClient = (): jest.Mocked<FirebaseAuthClient> => ({
  createUser:      jest.fn(),
  setCustomClaims: jest.fn(),
  disableUser:     jest.fn(),
  enableUser:      jest.fn(),
  updatePassword:  jest.fn(),
  deleteUser:      jest.fn(),
  verifyPassword:  jest.fn(),
} as unknown as jest.Mocked<FirebaseAuthClient>);

const makeOutbox = (): jest.Mocked<OutboxEventPublisher> =>
  ({ publishWithBatch: jest.fn() } as unknown as jest.Mocked<OutboxEventPublisher>);

const INPUT: CreateAdminInput = {
  firstName: 'Kavinda', lastName: 'Perera',
  email: 'kavinda@futurecx.com', initialPassword: 'Admin@Secure2026',
};

describe('CreateAdminUseCase', () => {
  let repo:       jest.Mocked<IUserRepository>;
  let authClient: jest.Mocked<FirebaseAuthClient>;
  let outbox:     jest.Mocked<OutboxEventPublisher>;
  let useCase:    CreateAdminUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repo       = makeRepo();
    authClient = makeAuthClient();
    outbox     = makeOutbox();
    useCase    = new CreateAdminUseCase(repo, authClient, outbox);
  });

  it('creates a new admin and returns the user', async () => {
    repo.findByEmail.mockResolvedValue(null);
    authClient.createUser.mockResolvedValue('new-uid');
    authClient.setCustomClaims.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    const user = await useCase.execute(INPUT, 'req-1');

    expect(user.email).toBe(INPUT.email);
    expect(user.role).toBe('admin');
    expect(user.status).toBe('approved');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ email: INPUT.email }));
    expect(outbox.publishWithBatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'admin.created' }),
    );
  });

  it('throws 409 EMAIL_EXISTS when email is already registered', async () => {
    repo.findByEmail.mockResolvedValue(makeUser());

    await expect(useCase.execute(INPUT, 'req-1')).rejects.toMatchObject({
      errorCode: 'EMAIL_EXISTS',
      status:    409,
    });
    expect(authClient.createUser).not.toHaveBeenCalled();
  });

  it('deletes the Firebase Auth user if Firestore create fails', async () => {
    repo.findByEmail.mockResolvedValue(null);
    authClient.createUser.mockResolvedValue('new-uid');
    authClient.setCustomClaims.mockResolvedValue(undefined);
    repo.create.mockRejectedValue(new Error('Firestore unavailable'));
    authClient.deleteUser.mockResolvedValue(undefined);

    await expect(useCase.execute(INPUT, 'req-1')).rejects.toThrow('Firestore unavailable');
    expect(authClient.deleteUser).toHaveBeenCalledWith('new-uid');
  });

  it('does not publish event if outbox write fails (error propagates)', async () => {
    repo.findByEmail.mockResolvedValue(null);
    authClient.createUser.mockResolvedValue('new-uid');
    authClient.setCustomClaims.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockRejectedValue(new Error('Outbox error'));
    authClient.deleteUser.mockResolvedValue(undefined);

    await expect(useCase.execute(INPUT, 'req-1')).rejects.toThrow('Outbox error');
  });
});
