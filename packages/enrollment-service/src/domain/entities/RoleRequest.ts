import { createHttpError } from '@shared/errors';

export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RoleRequestProps {
  id:            string;
  requesterUid:  string;
  requestedRole: 'student';
  status:        RoleRequestStatus;
  decidedByUid:  string | null;
  decisionNote:  string | null;
  createdAt:     string;
  decidedAt:     string | null;
}

export class RoleRequest {
  id:            string;
  requesterUid:  string;
  requestedRole: 'student';
  status:        RoleRequestStatus;
  decidedByUid:  string | null;
  decisionNote:  string | null;
  readonly createdAt: string;
  decidedAt:     string | null;

  constructor(props: RoleRequestProps) {
    this.id            = props.id;
    this.requesterUid  = props.requesterUid;
    this.requestedRole = props.requestedRole;
    this.status        = props.status;
    this.decidedByUid  = props.decidedByUid;
    this.decisionNote  = props.decisionNote;
    this.createdAt     = props.createdAt;
    this.decidedAt     = props.decidedAt;
  }

  approve(decidedByUid: string, note?: string): void {
    if (this.status !== 'pending') {
      throw createHttpError(409, 'INVALID_STATE', 'Role request is no longer pending.');
    }
    this.status       = 'approved';
    this.decidedByUid = decidedByUid;
    this.decisionNote = note ?? null;
    this.decidedAt    = new Date().toISOString();
  }

  reject(decidedByUid: string, note?: string): void {
    if (this.status !== 'pending') {
      throw createHttpError(409, 'INVALID_STATE', 'Role request is no longer pending.');
    }
    this.status       = 'rejected';
    this.decidedByUid = decidedByUid;
    this.decisionNote = note ?? null;
    this.decidedAt    = new Date().toISOString();
  }
}
