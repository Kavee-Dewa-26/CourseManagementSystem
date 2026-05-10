import { getAuth }                 from 'firebase-admin/auth';
import { getFirestore }            from 'firebase-admin/firestore';
import { createHttpError }         from '@shared/errors';
import { OutboxEventPublisher }    from '@shared/events';
import { UserServiceClient }       from '../../infrastructure/clients/UserServiceClient';
import { EnrollmentServiceClient } from '../../infrastructure/clients/EnrollmentServiceClient';

export interface RegisterInput {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
}

export class RegisterUseCase {
  constructor(
    private readonly userClient:       UserServiceClient,
    private readonly enrollmentClient: EnrollmentServiceClient,
    private readonly outbox:           OutboxEventPublisher,
  ) {}

  async execute(input: RegisterInput, requestId: string): Promise<void> {
    const exists = await this.userClient.emailExists(input.email);
    if (exists) throw createHttpError(409, 'EMAIL_EXISTS', 'Email address already registered.');

    const record = await getAuth().createUser({
      email:       input.email,
      password:    input.password,
      displayName: `${input.firstName} ${input.lastName}`,
    });

    try {
      await getAuth().setCustomUserClaims(record.uid, { role: 'student' });

      const now  = new Date().toISOString();
      const db   = getFirestore();
      const batch = db.batch();

      batch.set(db.collection('users').doc(record.uid), {
        email:           input.email,
        firstName:       input.firstName,
        lastName:        input.lastName,
        role:            'student',
        status:          'pending_approval',
        profilePhotoUrl: null,
        createdAt:       now,
        updatedAt:       now,
        deletedAt:       null,
      });

      await this.outbox.publishWithBatch({
        type:      'user.registered',
        payload:   { uid: record.uid, email: input.email, firstName: input.firstName, lastName: input.lastName },
        requestId,
      }, batch);

      await batch.commit();

      await this.enrollmentClient.createRegistration({
        studentUid: record.uid,
        email:      input.email,
        firstName:  input.firstName,
        lastName:   input.lastName,
      });
    } catch (err) {
      await getAuth().deleteUser(record.uid).catch(() => undefined);
      throw err;
    }
  }
}
