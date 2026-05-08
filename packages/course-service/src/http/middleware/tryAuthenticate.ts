import { Request, Response, NextFunction } from 'express';
import { getAuth }                          from 'firebase-admin/auth';
import { AuthenticatedRequest }             from '@shared/auth-middleware';

// Applies auth if a Bearer token is present — never rejects missing tokens.
// Used on public routes where role affects the response shape.
export function tryAuthenticate() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    try {
      const decoded = await getAuth().verifyIdToken(header.slice(7), true);
      const role    = decoded.role as string | undefined;
      if (role) {
        (req as AuthenticatedRequest).principal = { uid: decoded.uid, email: decoded.email ?? '', role: role as 'student' | 'admin' | 'super_admin' };
      }
    } catch { /* ignore bad tokens on public routes */ }
    next();
  };
}
