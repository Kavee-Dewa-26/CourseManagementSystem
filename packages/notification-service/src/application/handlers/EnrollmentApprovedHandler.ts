import { v4 as uuidv4 }              from 'uuid';
import { INotificationRepository }   from '../../domain/repositories/INotificationRepository';
import { Notification }              from '../../domain/entities/Notification';
import { NotificationDispatcher }    from '../services/NotificationDispatcher';

export interface EnrollmentApprovedPayload {
  studentUid: string;
  courseId:   string;
  email?:     string;
  fcmToken?:  string;
  courseTitle?: string;
}

export class EnrollmentApprovedHandler {
  constructor(
    private readonly notifRepo:  INotificationRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async handle(payload: EnrollmentApprovedPayload, requestId: string): Promise<void> {
    const title = 'Enrollment Approved';
    const body  = `Your enrollment${payload.courseTitle ? ` in ${payload.courseTitle}` : ''} has been approved.`;

    await this.notifRepo.create(new Notification({
      id:        uuidv4(),
      userUid:   payload.studentUid,
      type:      'enrollment.approved',
      title,
      body,
      read:      false,
      createdAt: new Date().toISOString(),
    }));

    if (payload.email) {
      await this.dispatcher.dispatchEmail(payload.email, title, `<p>${body}</p>`, requestId);
    }

    if (payload.fcmToken) {
      await this.dispatcher.dispatchPush(payload.fcmToken, title, body);
    }
  }
}
