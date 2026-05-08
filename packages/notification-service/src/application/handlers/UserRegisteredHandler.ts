import { v4 as uuidv4 }              from 'uuid';
import { INotificationRepository }   from '../../domain/repositories/INotificationRepository';
import { Notification }              from '../../domain/entities/Notification';
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
  ) {}

  async handle(payload: UserRegisteredPayload, _requestId: string): Promise<void> {
    const adminUids = await this.userClient.getAdminUids();
    const now       = new Date().toISOString();

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
  }
}
