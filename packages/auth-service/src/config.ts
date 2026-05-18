export const config = {
  serviceName:        process.env.SERVICE_NAME     ?? 'auth-service',
  port:               Number(process.env.PORT      ?? 3001),
  nodeEnv:            process.env.NODE_ENV         ?? 'development',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY ?? '',
  serviceUserUrl:     process.env.SERVICE_USER_URL ?? 'http://localhost:3002',
  serviceEnrollUrl:   process.env.SERVICE_ENROLLMENT_URL ?? 'http://localhost:3004',
  firebaseWebApiKey:  process.env.FIREBASE_WEB_API_KEY ?? '',
  smtpHost:           process.env.SMTP_HOST  ?? 'smtp.gmail.com',
  smtpPort:           Number(process.env.SMTP_PORT ?? 587),
  smtpUser:           process.env.SMTP_USER  ?? '',
  smtpPass:           process.env.SMTP_PASS  ?? '',
  // Federated OAuth — set these in .env for production
  googleClientId:     process.env.GOOGLE_CLIENT_ID ?? '',
  appleClientId:      process.env.APPLE_CLIENT_ID  ?? '',
} as const;
