import { createProxyMiddleware } from 'http-proxy-middleware';
import { config }                from '../config';

const strip = (prefix: string) => ({ [`^${prefix}`]: '' });

export const authProxy = createProxyMiddleware({
  target:      config.serviceAuthUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const userProxy = createProxyMiddleware({
  target:      config.serviceUserUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const courseProxy = createProxyMiddleware({
  target:      config.serviceCourseUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const enrollProxy = createProxyMiddleware({
  target:      config.serviceEnrollUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const progressProxy = createProxyMiddleware({
  target:      config.serviceProgressUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const storageProxy = createProxyMiddleware({
  target:      config.serviceStorageUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const notifyProxy = createProxyMiddleware({
  target:      config.serviceNotifyUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});

export const auditProxy = createProxyMiddleware({
  target:      config.serviceAuditUrl,
  changeOrigin: true,
  pathRewrite: strip('/api/v1'),
});
