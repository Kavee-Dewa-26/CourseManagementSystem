import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest }             from '@shared/auth-middleware';
import { fromZodError, createHttpError }    from '@shared/errors';
import { sendSuccess, sendPaginated }       from '@shared/response';
import { IRoleRequestRepository }           from '../../domain/repositories/IRoleRequestRepository';
import { CreateRoleRequestUseCase }         from '../../application/use-cases/CreateRoleRequestUseCase';
import { ApproveRoleRequestUseCase }        from '../../application/use-cases/ApproveRoleRequestUseCase';
import { RejectRoleRequestUseCase }         from '../../application/use-cases/RejectRoleRequestUseCase';
import { GetRoleRequestsUseCase }           from '../../application/use-cases/GetRoleRequestsUseCase';
import { GetMyRoleRequestsUseCase }         from '../../application/use-cases/GetMyRoleRequestsUseCase';
import { createRoleRequestSchema, decideRoleRequestSchema, listRoleRequestsSchema } from '../validators/roleRequestValidator';

export class RoleRequestController {
  constructor(
    private readonly createUseCase:   CreateRoleRequestUseCase,
    private readonly approveUseCase:  ApproveRoleRequestUseCase,
    private readonly rejectUseCase:   RejectRoleRequestUseCase,
    private readonly listUseCase:     GetRoleRequestsUseCase,
    private readonly myListUseCase:   GetMyRoleRequestsUseCase,
    private readonly roleRequestRepo: IRoleRequestRepository,
  ) {}

  // Member: POST /role-requests
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createRoleRequestSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const result = await this.createUseCase.execute(uid, requestId);
      sendSuccess(res, result, 201);
    } catch (err) { next(err); }
  };

  // Member: GET /role-requests/mine
  mine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { uid } = (req as AuthenticatedRequest).principal;
      const items   = await this.myListUseCase.execute(uid);
      sendSuccess(res, items);
    } catch (err) { next(err); }
  };

  // Admin: GET /role-requests
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listRoleRequestsSchema.safeParse(req.query);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const result = await this.listUseCase.execute(parsed.data);
      sendPaginated(res, result.items, result.nextCursor, result.total);
    } catch (err) { next(err); }
  };

  // Admin: GET /role-requests/:id  (§5.4 V2 spec)
  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleRequest = await this.roleRequestRepo.findById(req.params.id);
      if (!roleRequest) {
        return next(createHttpError(404, 'ROLE_REQUEST_NOT_FOUND', 'Role request not found.'));
      }
      sendSuccess(res, roleRequest);
    } catch (err) { next(err); }
  };

  // Admin: POST /role-requests/:id/approve
  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = decideRoleRequestSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const result = await this.approveUseCase.execute(req.params.id, uid, parsed.data.note, requestId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };

  // Admin: POST /role-requests/:id/reject
  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = decideRoleRequestSchema.safeParse(req.body);
      if (!parsed.success) return next(fromZodError(parsed.error));

      const { uid } = (req as AuthenticatedRequest).principal;
      const requestId = (req.headers['x-request-id'] as string) ?? '';
      const result = await this.rejectUseCase.execute(req.params.id, uid, parsed.data.note, requestId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };
}
