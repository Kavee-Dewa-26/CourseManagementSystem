export const config = {
  serviceName:        process.env.SERVICE_NAME     ?? 'auth-service',
  port:               Number(process.env.PORT      ?? 3001),
  nodeEnv:            process.env.NODE_ENV         ?? 'development',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY ?? '',
  serviceUserUrl:     process.env.SERVICE_USER_URL ?? 'http://localhost:3002',
  firebaseWebApiKey:  process.env.FIREBASE_WEB_API_KEY ?? '',
} as const;
