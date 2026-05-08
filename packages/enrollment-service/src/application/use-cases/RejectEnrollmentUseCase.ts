import { createHttpError }        from '@shared/errors';
import { OutboxEventPublisher }  from '@shared/events';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { Enrollment }            from '../../domain/entities/Enrollment';

export class RejectEnrollmentUseCase {
  constructor(
    private readonly enrollRepo: IEnrollmentRepository,
    private readonly outbox:     OutboxEventPublisher,
  ) {}

  async execute(id: string, reason: string | undefined, requestId: string): Promise<Enrollment> {
    const enrollment = await this.enrollRepo.findById(id);
    if (!enrollment) throw createHttpError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found.');

    enrollment.reject(reason);
    await this.enrollRepo.update(enrollment);
    await this.outbox.publishWithBatch({ type: 'enrollment.rejected', payload: { studentUid: enrollment.studentUid, courseId: enrollment.courseId, reason: reason ?? null }, requestId });

    return enrollment;
  }
}
