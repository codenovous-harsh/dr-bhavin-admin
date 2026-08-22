/**
 * Session token helpers shared by the middleware (edge runtime) and server
 * components (node runtime). Pure functions, no runtime-specific APIs.
 *
 * These read the JWT payload WITHOUT verifying its signature — that needs the
 * backend's secret, which this app does not and should not hold. Use the result
 * for ROUTING ONLY. Never treat it as proof of identity or role; the backend
 * re-checks both on every request.
 */

export type SessionClaims = {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export function readUnverifiedClaims(
  token: string | undefined
): SessionClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    // base64url -> base64, and re-pad: atob rejects unpadded input.
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(b64)) as SessionClaims;
  } catch {
    return null;
  }
}

/** Well-formed and not past `exp`. Not a signature check. */
export function looksLikeALiveSession(token: string | undefined): boolean {
  const claims = readUnverifiedClaims(token);
  if (!claims) return false;
  if (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
}
