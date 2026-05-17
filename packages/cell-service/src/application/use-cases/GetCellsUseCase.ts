import { ICellGroupRepository, CellGroupListOptions, CellGroupListResult } from '../../domain/repositories/ICellGroupRepository';
import { Role } from '@shared/auth-middleware';

export class GetCellsUseCase {
  constructor(private readonly cellRepo: ICellGroupRepository) {}

  async execute(opts: CellGroupListOptions, callerUid: string, callerRoles: Role[]): Promise<CellGroupListResult> {
    const isAdmin = callerRoles.includes('admin') || callerRoles.includes('super_admin');
    const isG12   = callerRoles.includes('g12');
    const isLeader = callerRoles.includes('leader');

    // Scope auto-applied by role (leaders see only their cells)
    if (!isAdmin && !isG12 && isLeader) {
      return this.cellRepo.findAll({ ...opts, leaderUid: callerUid, state: opts.state ?? 'active' });
    }

    // Members/students see all active cells (to find one to join)
    if (!isAdmin && !isG12 && !isLeader) {
      return this.cellRepo.findAll({ ...opts, state: 'active' });
    }

    // Admin/G12 see everything (or with state filter)
    return this.cellRepo.findAll({ ...opts, state: opts.state ?? 'active' });
  }
}
