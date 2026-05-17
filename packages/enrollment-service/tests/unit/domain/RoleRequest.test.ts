import { RoleRequest } from '../../../src/domain/entities/RoleRequest';

const make = (status: 'pending' | 'approved' | 'rejected' = 'pending'): RoleRequest =>
  new RoleRequest({
    id: 'req-1', requesterUid: 'uid-1', requestedRole: 'student',
    status, decidedByUid: null, decisionNote: null,
    createdAt: '2026-01-01T00:00:00.000Z', decidedAt: null,
  });

describe('RoleRequest entity', () => {
  describe('approve()', () => {
    it('transitions PENDING → approved', () => {
      const r = make('pending');
      r.approve('admin-uid', 'Welcome!');
      expect(r.status).toBe('approved');
    });

    it('sets decidedByUid and decisionNote', () => {
      const r = make();
      r.approve('admin-uid', 'Welcome!');
      expect(r.decidedByUid).toBe('admin-uid');
      expect(r.decisionNote).toBe('Welcome!');
    });

    it('sets decidedAt', () => {
      const r = make();
      r.approve('admin-uid');
      expect(r.decidedAt).not.toBeNull();
    });

    it('stores null note when not provided', () => {
      const r = make();
      r.approve('admin-uid');
      expect(r.decisionNote).toBeNull();
    });

    it('throws 409 when already approved', () => {
      expect(() => make('approved').approve('admin-uid')).toThrow(
        expect.objectContaining({ status: 409, errorCode: 'INVALID_STATE' }),
      );
    });

    it('throws 409 when already rejected', () => {
      expect(() => make('rejected').approve('admin-uid')).toThrow(
        expect.objectContaining({ status: 409 }),
      );
    });
  });

  describe('reject()', () => {
    it('transitions PENDING → rejected', () => {
      const r = make('pending');
      r.reject('admin-uid', 'Batch full');
      expect(r.status).toBe('rejected');
      expect(r.decisionNote).toBe('Batch full');
    });

    it('sets decidedAt and decidedByUid', () => {
      const r = make();
      r.reject('admin-uid');
      expect(r.decidedAt).not.toBeNull();
      expect(r.decidedByUid).toBe('admin-uid');
    });

    it('stores null note when not provided', () => {
      const r = make();
      r.reject('admin-uid');
      expect(r.decisionNote).toBeNull();
    });

    it('throws 409 when already rejected', () => {
      expect(() => make('rejected').reject('admin-uid')).toThrow(
        expect.objectContaining({ status: 409 }),
      );
    });

    it('throws 409 when already approved', () => {
      expect(() => make('approved').reject('admin-uid')).toThrow(
        expect.objectContaining({ status: 409 }),
      );
    });
  });
});
