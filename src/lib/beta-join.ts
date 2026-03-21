import { timingSafeEqual } from 'crypto';

/** Person types allowed for self-service beta signup (matches People API). */
export const BETA_PERSON_TYPES = [
  'musician',
  'superstar',
  'crew',
  'tour_manager',
  'productionmanager',
  'driver',
] as const;

export type BetaPersonType = (typeof BETA_PERSON_TYPES)[number];

export function getBetaJoinSecret(): string | undefined {
  const s = process.env.BETA_JOIN_SECRET?.trim();
  return s || undefined;
}

export function isBetaJoinEnabled(): boolean {
  return !!getBetaJoinSecret();
}

/** Constant-time compare so URL tokens are not leaked via timing. */
export function betaJoinTokenMatches(urlToken: string): boolean {
  const secret = getBetaJoinSecret();
  if (!secret || !urlToken) return false;
  try {
    const a = Buffer.from(urlToken, 'utf8');
    const b = Buffer.from(secret, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
