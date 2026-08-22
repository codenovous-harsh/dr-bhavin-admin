import { navItems } from '@/config/nav-config';
import { readUnverifiedClaims } from '@/lib/session';
import { rolePermits } from '@/lib/roles';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Landing redirect.
 *
 * This used to hard-redirect to /dashboard/overview, which is admin-only — an
 * editor signing in would land straight on an access-denied screen. Now it
 * sends each user to the first section their role can actually open.
 *
 * The role is read from the (unverified) JWT for routing only; see lib/session.
 */
export default async function Dashboard() {
  const token = (await cookies()).get('token')?.value;
  const role = readUnverifiedClaims(token)?.role;

  const first = navItems.find((item) =>
    rolePermits(role, (item.access as { role?: string } | undefined)?.role)
  );

  redirect(first?.url ?? '/dashboard/profile');
}
