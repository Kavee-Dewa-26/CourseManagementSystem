import { v4 as uuidv4 }              from 'uuid';
import { INotificationRepository }   from '../../domain/repositories/INotificationRepository';
import { Notification }              from '../../domain/entities/Notification';
import { NotificationDispatcher }    from '../services/NotificationDispatcher';

export interface EnrollmentRejectedPayload {
  studentUid: string;
  courseId:   string;
  email?:     string;
  reason?:    string | null;
}

export class EnrollmentRejectedHandler {
  constructor(
    private readonly notifRepo:  INotificationRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async handle(payload: EnrollmentRejectedPayload, requestId: string): Promise<void> {
    const body = payload.reason ? `Your enrollment was rejected: ${payload.reason}` : 'Your enrollment request was rejected.';

    await this.notifRepo.create(new Notification({
      id:        uuidv4(),
      userUid:   payload.studentUid,
      type:      'enrollment.rejected',
      title:     'Enrollment Rejected',
      body,
      read:      false,
      createdAt: new Date().toISOString(),
    }));

    if (payload.email) {
      await this.dispatcher.dispatchEmail(payload.email, 'Enrollment Update', `<p>${body}</p>`, requestId);
    }
  }
}
