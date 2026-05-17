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
