import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Read the current session in RSC / route handlers.
 * NextAuth's getServerSession throws on some failures (e.g. invalid JWT after secret change);
 * we return null so pages redirect to login instead of a bare 500.
 */
export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    console.error('[getSession] Failed to read session (try signing out or fix NEXTAUTH_SECRET):', err);
    return null;
  }
}

export function canEdit(role: string | undefined): boolean {
  return role === 'admin' || role === 'editor';
}

/** Edit Advance text, checklists, and files (not tour-wide editor features). */
export function canEditAdvance(role: string | undefined): boolean {
  return role === 'admin' || role === 'editor' || role === 'power_user';
}

/** Power user or above: can see Advance, more flights, etc. (power_user, editor, admin) */
export function canAccessAdvance(role: string | undefined): boolean {
  return role === 'admin' || role === 'editor' || role === 'power_user';
}

export function canAdmin(role: string | undefined): boolean {
  return role === 'admin';
}
