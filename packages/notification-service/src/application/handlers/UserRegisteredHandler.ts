import { v4 as uuidv4 }              from 'uuid';
import { INotificationRepository }   from '../../domain/repositories/INotificationRepository';
import { Notification }              from '../../domain/entities/Notification';
import { NotificationDispatcher }    from '../services/NotificationDispatcher';
import { UserServiceClient }         from '../../infrastructure/clients/UserServiceClient';

export interface UserRegisteredPayload {
  uid:       string;
  email:     string;
  firstName: string;
  lastName:  string;
}

export class UserRegisteredHandler {
  constructor(
    private readonly notifRepo:  INotificationRepository,
    private readonly userClient: UserServiceClient,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async handle(payload: UserRegisteredPayload, requestId: string): Promise<void> {
    const adminUids = await this.userClient.getAdminUids();
    const now       = new Date().toISOString();

    // In-app notification to all admins
    await Promise.all(adminUids.map(adminUid =>
      this.notifRepo.create(new Notification({
        id:        uuidv4(),
        userUid:   adminUid,
        type:      'user.registered',
        title:     'New Registration Pending',
        body:      `${payload.firstName} ${payload.lastName} has registered and is awaiting approval.`,
        read:      false,
        createdAt: now,
      })),
    ));

    // Confirmation email to the registering user
    await this.dispatcher.dispatchEmail(
      payload.email,
      'Registration Received — CMP',
      `<p>Hi ${payload.firstName},</p>
       <p>Thank you for registering on the Course Management Portal.</p>
       <p>Your account is currently <strong>pending approval</strong> by an administrator.</p>
       <p>You will receive another email once your account has been reviewed.</p>`,
      requestId,
    );
  }
}
