import { createHash, randomBytes } from 'crypto';

/** Raw token length in bytes (encoded as base64url in the email link). */
export const RESET_TOKEN_BYTES = 32;
/** Reset link validity. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
/** Rate limit: max new reset emails per user in this window. */
export const RESET_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const RESET_MAX_PER_WINDOW = 3;

export function hashResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

export function generateResetToken(): string {
  return randomBytes(RESET_TOKEN_BYTES).toString('base64url');
}

/**
 * Base URL for links in emails. Prefer NEXTAUTH_URL / PUBLIC_APP_URL; fall back to request Host (Vercel forwards x-forwarded-*).
 */
export function getPasswordResetBaseUrl(req: Request): string {
  const envUrl = (process.env.NEXTAUTH_URL || process.env.PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (envUrl) return envUrl;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return '';
  const proto = (req.headers.get('x-forwarded-proto') || 'https').split(',')[0]!.trim();
  return `${proto}://${host}`.replace(/\/$/, '');
}
