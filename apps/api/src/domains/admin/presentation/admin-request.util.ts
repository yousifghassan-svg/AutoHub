import type { Request } from 'express';

export function adminRequestContext(req: Request): {
  ip?: string;
  userAgent?: string;
} {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]
        : req.ip;
  const userAgent = req.headers['user-agent'];
  return { ip, userAgent };
}
