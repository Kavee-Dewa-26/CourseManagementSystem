import { IAuditRepository } from '../../domain/repositories/IAuditRepository';

export interface AuditEventPayload {
  actorUid?:    string | null;
  actorEmail?:  string | null;
  action:       string;
  category?:    string | null;
  ip?:          string | null;
  targetType?:  string | null;
  targetId?:    string | null;
  [key: string]: unknown;
}

export class AuditEventHandler {
  constructor(private readonly auditRepo: IAuditRepository) {}

  async handle(payload: AuditEventPayload, requestId: string): Promise<void> {
    await this.auditRepo.append({
      actorUid:   payload.actorUid   ?? null,
      actorEmail: payload.actorEmail ?? null,
      action:     payload.action,
      category:   payload.category   ?? null,
      ip:         payload.ip         ?? null,
      targetType: payload.targetType ?? null,
      targetId:   payload.targetId   ?? null,
      payload,
      requestId,
      createdAt:  new Date().toISOString(),
    });
  }
}
