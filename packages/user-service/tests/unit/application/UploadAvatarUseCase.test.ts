import { UploadAvatarUseCase, UploadAvatarInput } from '../../../src/application/use-cases/UploadAvatarUseCase';
import { IUserRepository }                        from '../../../src/domain/repositories/IUserRepository';
import { User }                                   from '../../../src/domain/entities/User';

// ── Firebase Storage mock ─────────────────────────────────────────────────────
const mockFile = { save: jest.fn(), makePublic: jest.fn() };
const mockBucket = { file: jest.fn().mockReturnValue(mockFile) };
const mockGetStorage = jest.fn().mockReturnValue({ bucket: jest.fn().mockReturnValue(mockBucket) });

jest.mock('firebase-admin/storage', () => ({ getStorage: () => mockGetStorage() }));
jest.mock('../../../src/config', () => ({ config: { storageBucket: 'test-bucket.appspot.com' } }));

// ── helpers ───────────────────────────────────────────────────────────────────
const makeUser = (overrides: Partial<InstanceType<typeof User>> = {}): User =>
  new User({
    uid: 'uid-1', email: 'student@example.com', firstName: 'Viruli',
    lastName: 'W', role: 'student', roles: ['student'], status: 'approved',
    profilePhotoUrl: null,
    createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', deletedAt: null,
    ...overrides,
  });

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  findAll:     jest.fn(),
  create:      jest.fn(),
  update:      jest.fn(),
  softDelete:  jest.fn(),
});

const PNG_BUF  = Buffer.from('png-bytes');
const JPEG_BUF = Buffer.from('jpg-bytes');

const pngInput  = (uid = 'uid-1'): UploadAvatarInput => ({ uid, buffer: PNG_BUF,  mimeType: 'image/png'  });
const jpegInput = (uid = 'uid-1'): UploadAvatarInput => ({ uid, buffer: JPEG_BUF, mimeType: 'image/jpeg' });

describe('UploadAvatarUseCase', () => {
  let repo:    jest.Mocked<IUserRepository>;
  let useCase: UploadAvatarUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFile.save.mockResolvedValue(undefined);
    mockFile.makePublic.mockResolvedValue(undefined);
    repo    = makeRepo();
    useCase = new UploadAvatarUseCase(repo);
  });

  describe('happy path', () => {
    it('uploads a PNG and returns user with profilePhotoUrl set', async () => {
      repo.findById.mockResolvedValue(makeUser());
      repo.update.mockResolvedValue(undefined);

      const user = await useCase.execute(pngInput());

      expect(mockFile.save).toHaveBeenCalledWith(PNG_BUF, { contentType: 'image/png' });
      expect(mockFile.makePublic).toHaveBeenCalled();
      expect(user.profilePhotoUrl).toBe(
        'https://storage.googleapis.com/test-bucket.appspot.com/avatars/uid-1.png',
      );
      expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({
        profilePhotoUrl: 'https://storage.googleapis.com/test-bucket.appspot.com/avatars/uid-1.png',
      }));
    });

    it('uploads a JPEG and uses .jpg extension in the URL', async () => {
      repo.findById.mockResolvedValue(makeUser());
      repo.update.mockResolvedValue(undefined);

      const user = await useCase.execute(jpegInput());

      expect(user.profilePhotoUrl).toBe(
        'https://storage.googleapis.com/test-bucket.appspot.com/avatars/uid-1.jpg',
      );
    });

    it('overwrites the previous photo (same file path per user)', async () => {
      repo.findById.mockResolvedValue(makeUser({ profilePhotoUrl: 'https://old-url.com/old.png' }));
      repo.update.mockResolvedValue(undefined);

      const user = await useCase.execute(pngInput());

      expect(mockBucket.file).toHaveBeenCalledWith('avatars/uid-1.png');
      expect(user.profilePhotoUrl).toContain('uid-1.png');
    });

    it('stores file under avatars/{uid}.{ext} path', async () => {
      repo.findById.mockResolvedValue(makeUser({ uid: 'special-uid' }));
      repo.update.mockResolvedValue(undefined);

      await useCase.execute(pngInput('special-uid'));

      expect(mockBucket.file).toHaveBeenCalledWith('avatars/special-uid.png');
    });
  });

  describe('error cases', () => {
    it('throws 404 USER_NOT_FOUND when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute(pngInput())).rejects.toMatchObject({
        status: 404, errorCode: 'USER_NOT_FOUND',
      });
      expect(mockFile.save).not.toHaveBeenCalled();
    });

    it('propagates storage save errors without updating the user', async () => {
      repo.findById.mockResolvedValue(makeUser());
      mockFile.save.mockRejectedValue(new Error('Storage unavailable'));

      await expect(useCase.execute(pngInput())).rejects.toThrow('Storage unavailable');
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('propagates makePublic errors without updating the user', async () => {
      repo.findById.mockResolvedValue(makeUser());
      mockFile.save.mockResolvedValue(undefined);
      mockFile.makePublic.mockRejectedValue(new Error('ACL error'));

      await expect(useCase.execute(pngInput())).rejects.toThrow('ACL error');
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
