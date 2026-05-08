import { IAuditRepository } from '../../domain/repositories/IAuditRepository';

export interface AuditEventPayload {
  actorUid?:   string | null;
  action:      string;
  targetType?: string | null;
  targetId?:   string | null;
  [key: string]: unknown;
}

export class AuditEventHandler {
  constructor(private readonly auditRepo: IAuditRepository) {}

  async handle(payload: AuditEventPayload, requestId: string): Promise<void> {
    await this.auditRepo.append({
      actorUid:   payload.actorUid ?? null,
      action:     payload.action,
      targetType: payload.targetType ?? null,
      targetId:   payload.targetId ?? null,
      payload,
      requestId,
      createdAt:  new Date().toISOString(),
    });
  }
}
