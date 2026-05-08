import { Request, Response, NextFunction } from 'express';
import { mustBeOwnerOrAdmin, AuthenticatedRequest, Principal } from '../../src/index';

jest.mock('@shared/errors', () => ({
  createHttpError: (status: number, code: string, message: string) => {
    const err: any = new Error(message);
    err.status    = status;
    err.errorCode = code;
    return err;
  },
}));

function makeReq(principal: Principal): Request {
  const req = { principal } as AuthenticatedRequest;
  return req as unknown as Request;
}

const res  = {} as Response;
const next = jest.fn() as unknown as NextFunction;

describe('mustBeOwnerOrAdmin()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes when the student is the resource owner', () => {
    const req = makeReq({ uid: 'owner-uid', email: 'e@e.com', role: 'student' });
    mustBeOwnerOrAdmin(() => 'owner-uid')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(403) when student is NOT the owner', () => {
    const req = makeReq({ uid: 'other-uid', email: 'e@e.com', role: 'student' });
    mustBeOwnerOrAdmin(() => 'owner-uid')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, errorCode: 'FORBIDDEN' }),
    );
  });

  it('passes when caller is admin regardless of ownership', () => {
    const req = makeReq({ uid: 'admin-uid', email: 'a@a.com', role: 'admin' });
    mustBeOwnerOrAdmin(() => 'owner-uid')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes when caller is super_admin regardless of ownership', () => {
    const req = makeReq({ uid: 'sadmin-uid', email: 'sa@sa.com', role: 'super_admin' });
    mustBeOwnerOrAdmin(() => 'owner-uid')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes when getResourceUid returns undefined (resource has no owner constraint)', () => {
    const req = makeReq({ uid: 'anyone', email: 'x@x.com', role: 'student' });
    mustBeOwnerOrAdmin(() => undefined)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('extracts resourceUid from req correctly', () => {
    const req = makeReq({ uid: 'user-abc', email: 'e@e.com', role: 'student' });
    (req as any).params = { uid: 'user-abc' };

    mustBeOwnerOrAdmin(r => (r as any).params?.uid)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
