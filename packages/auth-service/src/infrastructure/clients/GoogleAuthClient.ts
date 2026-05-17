import { OAuth2Client }  from 'google-auth-library';
import { createHttpError } from '@shared/errors';
import { config }          from '../../config';

export interface GooglePayload {
  email:     string;
  name:      string;
  googleUid: string; // Google's sub claim
}

export class GoogleAuthClient {
  private readonly client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(config.googleClientId);
  }

  async verifyIdToken(idToken: string): Promise<GooglePayload> {
    try {
      const ticket  = await this.client.verifyIdToken({
        idToken,
        audience: config.googleClientId || undefined, // skip audience check if not configured
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw createHttpError(401, 'FEDERATED_TOKEN_INVALID', 'Google token is missing email claim.');
      }
      return {
        email:     payload.email,
        name:      payload.name ?? payload.email.split('@')[0],
        googleUid: payload.sub,
      };
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 401) throw err;
      throw createHttpError(401, 'FEDERATED_TOKEN_INVALID', 'Google ID token verification failed.');
    }
  }
}
