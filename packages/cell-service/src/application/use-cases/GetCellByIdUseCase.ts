import { createHttpError }       from '@shared/errors';
import { ICellGroupRepository }  from '../../domain/repositories/ICellGroupRepository';
import { CellGroup }             from '../../domain/entities/CellGroup';
import { Role }                  from '@shared/auth-middleware';

export class GetCellByIdUseCase {
  constructor(private readonly cellRepo: ICellGroupRepository) {}

  async execute(id: string, callerUid: string, callerRoles: Role[]): Promise<CellGroup> {
    const cell = await this.cellRepo.findById(id);
    if (!cell) throw createHttpError(404, 'CELL_NOT_FOUND', 'Cell group not found.');

    const isAdmin  = callerRoles.includes('admin') || callerRoles.includes('super_admin');
    const isOwner  = cell.isOwnedBy(callerUid);
    const isMember = cell.hasMember(callerUid);

    if (!isAdmin && !isOwner && !isMember) {
      throw createHttpError(403, 'FORBIDDEN', 'You do not have access to this cell group.');
    }

    return cell;
  }
}
