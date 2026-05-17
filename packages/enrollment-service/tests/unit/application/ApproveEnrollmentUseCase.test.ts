import { ApproveEnrollmentUseCase } from '../../../src/application/use-cases/ApproveEnrollmentUseCase';
import { IEnrollmentRepository }   from '../../../src/domain/repositories/IEnrollmentRepository';
import { OutboxEventPublisher }    from '@shared/events';
import { Enrollment }              from '../../../src/domain/entities/Enrollment';

const makeEnrollment = (state: 'pending' | 'approved' | 'rejected' | 'withdrawn' = 'pending'): Enrollment =>
  new Enrollment({ id: 'uid-1_course-1', studentUid: 'uid-1', courseId: 'course-1', state, reason: null, rejectedAt: null, approvedAt: null, withdrawnAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });

const makeRepo = (): jest.Mocked<IEnrollmentRepository> => ({
  findById:              jest.fn(),
  findByStudentAndCourse: jest.fn(),
  findByStudent:         jest.fn(),
  findAll:               jest.fn(),
  create:                jest.fn(),
  update:                jest.fn(),
});

const makeOutbox = (): jest.Mocked<OutboxEventPublisher> =>
  ({ publishWithBatch: jest.fn() } as unknown as jest.Mocked<OutboxEventPublisher>);

describe('ApproveEnrollmentUseCase', () => {
  let repo:    jest.Mocked<IEnrollmentRepository>;
  let outbox:  jest.Mocked<OutboxEventPublisher>;
  let useCase: ApproveEnrollmentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repo    = makeRepo();
    outbox  = makeOutbox();
    useCase = new ApproveEnrollmentUseCase(repo, outbox);
  });

  it('approves enrollment and publishes enrollment.approved event', async () => {
    repo.findById.mockResolvedValue(makeEnrollment('pending'));
    repo.update.mockResolvedValue(undefined);
    outbox.publishWithBatch.mockResolvedValue(undefined);

    const result = await useCase.execute('uid-1_course-1', 'req-1');

    expect(result.state).toBe('approved');
    expect(result.approvedAt).not.toBeNull();
    expect(outbox.publishWithBatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'enrollment.approved', payload: expect.objectContaining({ studentUid: 'uid-1', courseId: 'course-1' }) }),
    );
  });

  it('throws 404 ENROLLMENT_NOT_FOUND when enrollment does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('uid-1_course-1', 'req-1')).rejects.toMatchObject({
      status:    404,
      errorCode: 'ENROLLMENT_NOT_FOUND',
    });
  });

  it('throws 409 INVALID_STATE when enrollment is already approved', async () => {
    repo.findById.mockResolvedValue(makeEnrollment('approved'));
    await expect(useCase.execute('uid-1_course-1', 'req-1')).rejects.toMatchObject({
      status:    409,
      errorCode: 'INVALID_STATE',
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws 409 INVALID_STATE when enrollment is rejected', async () => {
    repo.findById.mockResolvedValue(makeEnrollment('rejected'));
    await expect(useCase.execute('uid-1_course-1', 'req-1')).rejects.toMatchObject({
      status:    409,
      errorCode: 'INVALID_STATE',
    });
  });
});
