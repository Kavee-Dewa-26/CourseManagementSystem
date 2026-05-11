import { NotificationDispatcher } from '../services/NotificationDispatcher';

export interface AdminCreatedPayload {
  uid:       string;
  email:     string;
  firstName: string;
  lastName:  string;
  actorUid?: string;
  promoted?: boolean;
}

export class AdminCreatedHandler {
  constructor(
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async handle(payload: AdminCreatedPayload, requestId: string): Promise<void> {
    const subject = payload.promoted
      ? 'You have been promoted to Admin — CMP'
      : 'Your Admin Account has been Created — CMP';

    const html = payload.promoted
      ? `<p>Hi ${payload.firstName},</p>
         <p>Your account on the Course Management Portal has been promoted to <strong>Admin</strong>.</p>
         <p>You now have access to manage courses, enrollments, and student registrations.</p>
         <p>Log in with your existing credentials to get started.</p>`
      : `<p>Hi ${payload.firstName},</p>
         <p>An Admin account has been created for you on the Course Management Portal.</p>
         <p>Log in with the credentials provided to you by the Super Admin.</p>
         <p>We recommend changing your password after your first login.</p>`;

    await this.dispatcher.dispatchEmail(payload.email, subject, html, requestId);
  }
}
