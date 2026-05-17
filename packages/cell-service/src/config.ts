export const config = {
  serviceName:        process.env.SERVICE_NAME          ?? 'cell-service',
  port:               Number(process.env.PORT           ?? 3010),
  nodeEnv:            process.env.NODE_ENV              ?? 'development',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY  ?? '',
} as const;
