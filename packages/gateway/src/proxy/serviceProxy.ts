import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request }               from 'express';
import { config }                from '../config';

// Express strips the mount prefix from req.url before the proxy sees it,
// so use req.originalUrl (full path) and strip only /api/v1 from that.
const rewrite = (_path: string, req: Request) =>
  req.originalUrl.replace(/^\/api\/v1/, '');

const makeProxy = (target: string) =>
  createProxyMiddleware({ target, changeOrigin: true, pathRewrite: rewrite });

export const authProxy     = makeProxy(config.serviceAuthUrl);
export const userProxy     = makeProxy(config.serviceUserUrl);
export const courseProxy   = makeProxy(config.serviceCourseUrl);
export const enrollProxy   = makeProxy(config.serviceEnrollUrl);
export const progressProxy = makeProxy(config.serviceProgressUrl);
export const storageProxy  = makeProxy(config.serviceStorageUrl);
export const notifyProxy   = makeProxy(config.serviceNotifyUrl);
export const auditProxy    = makeProxy(config.serviceAuditUrl);
