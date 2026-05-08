export const config = {
  serviceName:        process.env.SERVICE_NAME    ?? 'user-service',
  port:               Number(process.env.PORT     ?? 3002),
  nodeEnv:            process.env.NODE_ENV        ?? 'development',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY ?? '',
  firebaseWebApiKey:  process.env.FIREBASE_WEB_API_KEY ?? '',
} as const;
