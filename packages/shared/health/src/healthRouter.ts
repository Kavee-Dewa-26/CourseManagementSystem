import { Router } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

export const healthRouter = Router();

// Liveness — process is alive
healthRouter.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: process.env.SERVICE_NAME });
});

// Readiness — Firestore is reachable
healthRouter.get('/readyz', async (_req, res) => {
  try {
    await getFirestore().collection('_health').doc('probe').get();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready', error: 'Firestore unreachable' });
  }
});
