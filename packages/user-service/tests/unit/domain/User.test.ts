import { User, UserProps } from '../../../src/domain/entities/User';

function makeUser(overrides: Partial<UserProps> = {}): User {
  return new User({
    uid:             'uid-1',
    email:           'viruli@example.com',
    firstName:       'Viruli',
    lastName:        'Weerasinghe',
    role:            'student',
    status:          'approved',
    profilePhotoUrl: null,
    createdAt:       '2026-05-01T08:00:00.000Z',
    updatedAt:       '2026-05-01T08:00:00.000Z',
    deletedAt:       null,
    ...overrides,
  });
}

describe('User entity', () => {

  describe('fullName', () => {
    it('returns firstName and lastName joined', () => {
      expect(makeUser().fullName).toBe('Viruli Weerasinghe');
    });
  });

  describe('isActive()', () => {
    it('returns true when status is approved and not deleted', () => {
      expect(makeUser({ status: 'approved', deletedAt: null }).isActive()).toBe(true);
    });

    it('returns false when status is suspended', () => {
      expect(makeUser({ status: 'suspended' }).isActive()).toBe(false);
    });

    it('returns false when deletedAt is set', () => {
      expect(makeUser({ deletedAt: '2026-05-07T10:00:00.000Z' }).isActive()).toBe(false);
    });
  });

  describe('suspend()', () => {
    it('sets status to suspended', () => {
      const user = makeUser({ status: 'approved' });
      user.suspend();
      expect(user.status).toBe('suspended');
    });

    it('updates updatedAt', () => {
      const user = makeUser();
      const before = user.updatedAt;
      user.suspend();
      expect(user.updatedAt).not.toBe(before);
    });
  });

  describe('reactivate()', () => {
    it('sets status back to approved', () => {
      const user = makeUser({ status: 'suspended' });
      user.reactivate();
      expect(user.status).toBe('approved');
    });
  });

  describe('approve()', () => {
    it('sets status to approved', () => {
      const user = makeUser({ status: 'pending_approval' });
      user.approve();
      expect(user.status).toBe('approved');
    });
  });

  describe('updateProfile()', () => {
    it('updates only the provided fields', () => {
      const user = makeUser();
      user.updateProfile({ firstName: 'Kavinda' });
      expect(user.firstName).toBe('Kavinda');
      expect(user.lastName).toBe('Weerasinghe'); // unchanged
    });

    it('updates profilePhotoUrl to null when explicitly set', () => {
      const user = makeUser({ profilePhotoUrl: 'https://old-url.com' });
      user.updateProfile({ profilePhotoUrl: null });
      expect(user.profilePhotoUrl).toBeNull();
    });

    it('does not change fields when no fields provided', () => {
      const user = makeUser();
      const before = { firstName: user.firstName, lastName: user.lastName };
      user.updateProfile({});
      expect(user.firstName).toBe(before.firstName);
      expect(user.lastName).toBe(before.lastName);
    });
  });

  describe('softDelete()', () => {
    it('sets deletedAt to a timestamp', () => {
      const user = makeUser();
      expect(user.deletedAt).toBeNull();
      user.softDelete();
      expect(user.deletedAt).not.toBeNull();
      expect(() => new Date(user.deletedAt!)).not.toThrow();
    });

    it('isDeleted() returns true after softDelete', () => {
      const user = makeUser();
      user.softDelete();
      expect(user.isDeleted()).toBe(true);
    });
  });
});
