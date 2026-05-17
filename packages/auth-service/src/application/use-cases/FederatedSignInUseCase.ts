import { getAuth }              from 'firebase-admin/auth';
import { getFirestore }         from 'firebase-admin/firestore';
import { createHttpError }      from '@shared/errors';
import { OutboxEventPublisher } from '@shared/events';
import { GoogleAuthClient }     from '../../infrastructure/clients/GoogleAuthClient';
import { AppleAuthClient }      from '../../infrastructure/clients/AppleAuthClient';

export type FederatedProvider = 'google' | 'apple';

export interface FederatedSignInResult {
  firebaseToken: string;
  uid:           string;
  isNewUser:     boolean;
}

export interface VerifiedFederatedPayload {
  email:       string;
  displayName: string;
  providerUid: string;
  providerId:  'google.com' | 'apple.com';
}

export class FederatedSignInUseCase {
  constructor(
    private readonly googleClient: GoogleAuthClient,
    private readonly appleClient:  AppleAuthClient,
    private readonly outbox:       OutboxEventPublisher,
  ) {}

  async execute(
    provider:          FederatedProvider,
    idToken:           string,
    preferredLanguage: string,
    requestId:         string,
  ): Promise<FederatedSignInResult> {
    // 1. Verify token with appropriate provider client
    const payload = await this.verifyToken(provider, idToken);

    // 2. Find or create Firebase user
    let uid:       string;
    let isNewUser: boolean;

    try {
      const existingUser = await getAuth().getUserByEmail(payload.email);
      uid       = existingUser.uid;
      isNewUser = false;
    } catch {
      // User not found — create new Member
      const newRecord = await getAuth().createUser({
        email:         payload.email,
        displayName:   payload.displayName,
        emailVerified: true,
      });
      uid       = newRecord.uid;
      isNewUser = true;

      await getAuth().setCustomUserClaims(uid, { role: 'member', roles: ['member'] });

      const now = new Date().toISOString();
      await getFirestore().collection('users').doc(uid).set({
        email:                   payload.email,
        firstName:               payload.displayName.split(' ')[0] ?? payload.displayName,
        lastName:                payload.displayName.split(' ').slice(1).join(' ') || '',
        role:                    'member',
        roles:                   ['member'],
        status:                  'approved',
        profilePhotoUrl:         null,
        preferredLanguage:       preferredLanguage,
        fcmTokens:               [],
        notificationPreferences: { email: true, push: true },
        providers:               [payload.providerId],
        createdAt:               now,
        updatedAt:               now,
        deletedAt:               null,
      });

      await this.outbox.publishWithBatch({
        type:      'user.registered',
        payload:   { uid, email: payload.email, firstName: payload.displayName },
        requestId,
      });
    }

    // 3. For existing users, ensure this provider is tracked
    if (!isNewUser) {
      const userDoc = await getFirestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data      = userDoc.data()!;
        const providers: string[] = (data.providers as string[] | undefined) ?? ['password'];
        if (!providers.includes(payload.providerId)) {
          await getFirestore().collection('users').doc(uid).update({
            providers: [...providers, payload.providerId],
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // 4. Issue Firebase custom token — client exchanges via signInWithCustomToken()
    const firebaseToken = await getAuth().createCustomToken(uid);

    return { firebaseToken, uid, isNewUser };
  }

  // Internal verification — also used by the internal verify endpoint
  async verifyToken(provider: FederatedProvider, idToken: string): Promise<VerifiedFederatedPayload> {
    if (provider === 'google') {
      const p = await this.googleClient.verifyIdToken(idToken);
      return {
        email:       p.email,
        displayName: p.name,
        providerUid: p.googleUid,
        providerId:  'google.com',
      };
    } else if (provider === 'apple') {
      const p = await this.appleClient.verifyIdToken(idToken);
      return {
        email:       p.email,
        displayName: p.email.split('@')[0],
        providerUid: p.appleUid,
        providerId:  'apple.com',
      };
    }
    throw createHttpError(400, 'VALIDATION_ERROR', 'Unknown provider. Must be "google" or "apple".');
  }
}
