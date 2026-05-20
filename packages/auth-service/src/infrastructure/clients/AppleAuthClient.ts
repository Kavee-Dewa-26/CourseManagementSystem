import jwt                  from 'jsonwebtoken';
import jwksClient            from 'jwks-rsa';
import { createHttpError }   from '@shared/errors';
import { config }            from '../../config';

export interface ApplePayload {
  email:    string;
  appleUid: string; // Apple's sub claim
}

const APPLE_JWKS_URI = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER   = 'https://appleid.apple.com';

const jwks = jwksClient({
  jwksUri:         APPLE_JWKS_URI,
  cache:           true,
  cacheMaxEntries: 5,
  cacheMaxAge:     600_000, // 10 min
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) return reject(new Error('No kid in JWT header'));
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

export class AppleAuthClient {
  async verifyIdToken(idToken: string): Promise<ApplePayload> {
    // Emulator bypass: accept base64-encoded JSON test payload in non-production
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.NODE_ENV !== 'production') {
      try {
        const parsed = JSON.parse(Buffer.from(idToken, 'base64').toString('utf8')) as Record<string, unknown>;
        if (typeof parsed?.email === 'string') {
          return {
            email:    parsed.email,
            appleUid: (parsed.sub as string | undefined) ?? parsed.email,
          };
        }
      } catch { /* not a test payload — fall through to real verification */ }
    }

    try {
      const decoded = await new Promise<jwt.JwtPayload>((resolve, reject) => {
        jwt.verify(
          idToken,
          (header, cb) => {
            getSigningKey(header)
              .then(key => cb(null, key))
              .catch((err: Error) => cb(err));
          },
          {
            issuer:     APPLE_ISSUER,
            audience:   config.appleClientId || undefined,
            algorithms: ['RS256'],
          },
          (err, payload) => {
            if (err) return reject(err);
            resolve(payload as jwt.JwtPayload);
          },
        );
      });

      const email = (decoded['email'] as string | undefined)
        ?? decoded['sub'] + '@privaterelay.appleid.com';

      return { email, appleUid: decoded['sub'] as string };
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 401) throw err;
      throw createHttpError(401, 'FEDERATED_TOKEN_INVALID', 'Apple identity token verification failed.');
    }
  }
}
