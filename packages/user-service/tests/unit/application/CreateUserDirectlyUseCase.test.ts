import {
  CreateUserDirectlyUseCase,
  CreateUserDirectlyInput,
} from '../../../src/application/use-cases/CreateUserDirectlyUseCase';
import { IUserRepository }    from '../../../src/domain/repositories/IUserRepository';
import { FirebaseAuthClient } from '../../../src/infrastructure/clients/FirebaseAuthClient';
import { OutboxEventPublisher } from '@shared/events';
import { User }               from '../../../src/domain/entities/User';

const makeUser = (overrides = {}): User =>
  new User({
    uid: 'uid-1', email: 'leader@tccr.lk', firstName: 'Saman',
    lastName: 'Silva', role: 'leader', roles: ['member', 'leader'], status: 'approved',
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

const LEADER_INPUT: CreateUserDirectlyInput = {
  firstName: 'Saman', lastName: 'Silva',
  email: 'leader@tccr.lk', initialPassword: 'Leader@12345',
  role: 'leader',
};

const G12_INPUT: CreateUserDirectlyInput = {
  firstName: 'Nimal', lastName: 'Perera',
  email: 'g12@tccr.lk', initialPassword: 'G12Lead@123',
  role: 'g12',
};

describe('CreateUserDirectlyUseCase', () => {
  let repo:       jest.Mocked<IUserRepository>;
  let authClient: jest.Mocked<FirebaseAuthClient>;
  let outbox:     jest.Mocked<OutboxEventPublisher>;
  let useCase:    CreateUserDirectlyUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repo       = makeRepo();
    authClient = makeAuthClient();
    outbox     = makeOutbox();
    useCase    = new CreateUserDirectlyUseCase(repo, authClient, outbox);
  });

  describe('leader role', () => {
    it('creates the Firebase Auth account and Firestore record', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      const user = await useCase.execute(LEADER_INPUT, 'req-1');

      expect(authClient.createUser).toHaveBeenCalledWith({
        email:       LEADER_INPUT.email,
        password:    LEADER_INPUT.initialPassword,
        displayName: 'Saman Silva',
      });
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ email: LEADER_INPUT.email }));
      expect(user.uid).toBe('new-uid');
    });

    it('returns the user with role=leader, roles=[member,leader], status=approved', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      const user = await useCase.execute(LEADER_INPUT, 'req-1');

      expect(user.role).toBe('leader');
      expect(user.roles).toEqual(['member', 'leader']);
      expect(user.status).toBe('approved');
    });

    it('sets custom claims with role=leader and roles=[member,leader]', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      await useCase.execute(LEADER_INPUT, 'req-1');

      expect(authClient.setCustomClaims).toHaveBeenCalledWith('new-uid', {
        role:  'leader',
        roles: ['member', 'leader'],
      });
    });

    it('publishes admin.created outbox event', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      await useCase.execute(LEADER_INPUT, 'req-abc');

      expect(outbox.publishWithBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type:      'admin.created',
          payload:   expect.objectContaining({ uid: 'new-uid', email: LEADER_INPUT.email }),
          requestId: 'req-abc',
        }),
      );
    });
  });

  describe('g12 role', () => {
    it('returns the user with role=g12, roles=[member,g12]', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('g12-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      const user = await useCase.execute(G12_INPUT, 'req-2');

      expect(user.role).toBe('g12');
      expect(user.roles).toEqual(['member', 'g12']);
    });

    it('sets custom claims with role=g12 and roles=[member,g12]', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('g12-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockResolvedValue(undefined);

      await useCase.execute(G12_INPUT, 'req-2');

      expect(authClient.setCustomClaims).toHaveBeenCalledWith('g12-uid', {
        role:  'g12',
        roles: ['member', 'g12'],
      });
    });
  });

  describe('error cases', () => {
    it('throws 409 EMAIL_EXISTS when email is already registered', async () => {
      repo.findByEmail.mockResolvedValue(makeUser());

      await expect(useCase.execute(LEADER_INPUT, 'req-1')).rejects.toMatchObject({
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

      await expect(useCase.execute(LEADER_INPUT, 'req-1')).rejects.toThrow('Firestore unavailable');
      expect(authClient.deleteUser).toHaveBeenCalledWith('new-uid');
    });

    it('deletes the Firebase Auth user if setCustomClaims fails', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockRejectedValue(new Error('Claims error'));
      authClient.deleteUser.mockResolvedValue(undefined);

      await expect(useCase.execute(LEADER_INPUT, 'req-1')).rejects.toThrow('Claims error');
      expect(authClient.deleteUser).toHaveBeenCalledWith('new-uid');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('does not swallow outbox error — rolls back Firebase Auth user', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockResolvedValue('new-uid');
      authClient.setCustomClaims.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(undefined);
      outbox.publishWithBatch.mockRejectedValue(new Error('Outbox error'));
      authClient.deleteUser.mockResolvedValue(undefined);

      await expect(useCase.execute(LEADER_INPUT, 'req-1')).rejects.toThrow('Outbox error');
      expect(authClient.deleteUser).toHaveBeenCalledWith('new-uid');
    });

    it('does not attempt Firestore rollback if Firebase Auth creation fails', async () => {
      repo.findByEmail.mockResolvedValue(null);
      authClient.createUser.mockRejectedValue(new Error('Firebase Auth error'));

      await expect(useCase.execute(LEADER_INPUT, 'req-1')).rejects.toThrow('Firebase Auth error');
      expect(authClient.deleteUser).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
