import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Public routes that should redirect to dashboard if already logged in
const publicRoutes = ['/auth/sign-in', '/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current path is a public auth route
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect to sign-in if accessing protected route without token
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};
