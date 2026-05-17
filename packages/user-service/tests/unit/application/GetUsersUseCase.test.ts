import { GetUsersUseCase }                     from '../../../src/application/use-cases/GetUsersUseCase';
import { IUserRepository, FindAllResult }       from '../../../src/domain/repositories/IUserRepository';
import { User }                                 from '../../../src/domain/entities/User';

const makeUser = (): User =>
  new User({
    uid: 'uid-1', email: 'u@example.com', firstName: 'A', lastName: 'B',
    role: 'student', roles: ['student'], status: 'approved',
    profilePhotoUrl: null, createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z', deletedAt: null,
  });

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  findAll:     jest.fn(),
  create:      jest.fn(),
  update:      jest.fn(),
  softDelete:  jest.fn(),
});

describe('GetUsersUseCase', () => {
  let repo:    jest.Mocked<IUserRepository>;
  let useCase: GetUsersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repo    = makeRepo();
    useCase = new GetUsersUseCase(repo);
  });

  it('delegates to findAll and returns the result', async () => {
    const result: FindAllResult = { items: [makeUser()], nextCursor: null, total: 1 };
    repo.findAll.mockResolvedValue(result);

    const output = await useCase.execute({ limit: 10 });

    expect(output).toEqual(result);
    expect(repo.findAll).toHaveBeenCalledWith({ limit: 10 });
  });

  it('passes filter options to findAll', async () => {
    const result: FindAllResult = { items: [], nextCursor: null, total: 0 };
    repo.findAll.mockResolvedValue(result);

    await useCase.execute({ limit: 5, role: 'admin', status: 'approved' });

    expect(repo.findAll).toHaveBeenCalledWith({ limit: 5, role: 'admin', status: 'approved' });
  });

  it('propagates repo errors', async () => {
    repo.findAll.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({ limit: 10 })).rejects.toThrow('DB error');
  });
});
