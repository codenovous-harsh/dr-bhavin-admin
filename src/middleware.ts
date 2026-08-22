import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { looksLikeALiveSession } from '@/lib/session';

/**
 * Routing guard.
 *
 * SCOPE: this decides which page to *show*. It is not an authorization
 * boundary and cannot be one — it does not hold JWT_SECRET, so it cannot
 * verify a token's signature. Every protected read/write is enforced by the
 * backend (`protect` + `authorize` in
 * dr-bhavin-garara-backend/src/middleware/auth.middleware.js), which is where
 * the check is real. See `src/lib/roles.ts` for the verified matrix.
 *
 * What changed: this used to treat ANY non-empty `token` cookie as a valid
 * session, so an expired or malformed token would sail through and land the
 * user on a dashboard that then failed every request with 401s. We now read
 * the (unverified) JWT payload just far enough to check shape and expiry, and
 * send stale sessions back to sign-in with the destination preserved.
 */

const protectedRoutes = ['/dashboard'];

// Public routes that should redirect to the dashboard if already signed in.
//
// /auth/sign-up was removed: the page collected a name, email and password and
// then just router.push()'d to the dashboard without calling
// authService.register(), so credentials were silently discarded. Nothing in
// the UI linked to it. Accounts are provisioned by a superadmin through
// /dashboard/users (userService.createUser) — this system holds patient data,
// so it should not carry open self-registration.
// Only sign-in. Deliberately NOT forgot-password / reset-password: someone can
// hold a live session and still legitimately need to complete a reset from an
// emailed link, and bouncing them to the dashboard would strand that flow.
const publicRoutes = ['/auth/sign-in'];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const hasSession = looksLikeALiveSession(token);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !hasSession) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(signInUrl);
    // Clear a dead cookie so the user isn't bounced in a loop.
    if (token) response.cookies.delete('token');
    return response;
  }

  if (isPublicRoute && hasSession) {
    // /dashboard resolves the correct landing page for this role — an
    // editor cannot see /dashboard/overview.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
};
