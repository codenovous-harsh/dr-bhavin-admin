'use client';

import { navItems } from '@/config/nav-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLE_LABEL, rolePermits, type Role } from '@/lib/roles';
import { IconLock } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Enforces each route's required role, derived from `nav-config`.
 *
 * Wrapping pages individually meant every new admin screen had to remember to
 * add a guard. Here the nav entry IS the declaration: give an item an
 * `access.role` and its route (plus children) is guarded, with no per-page
 * wiring to forget.
 *
 * UX ONLY — the role comes from localStorage, which the user can edit. Real
 * enforcement is the backend's `protect` + `authorize`; see `lib/roles.ts` for
 * the verified matrix. The value here is that someone without access gets a
 * clear explanation instead of a page that renders and then fills with 403s.
 */
export function RouteRoleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();

  // Longest matching prefix wins, so /dashboard/patients/[id] inherits the
  // requirement declared on /dashboard/patients.
  const match = navItems
    .filter(
      (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
    )
    .sort((a, b) => b.url.length - a.url.length)[0];

  const required = (match?.access as { role?: Role } | undefined)?.role;

  if (!required) return <>{children}</>;

  // Never flash the denial screen before the role is known.
  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        <div className='bg-muted h-40 w-full max-w-3xl animate-pulse rounded-lg' />
      </div>
    );
  }

  if (!rolePermits(user?.role, required)) {
    return <AccessDenied required={required} actual={user?.role} />;
  }

  return <>{children}</>;
}

function AccessDenied({
  required,
  actual
}: {
  required: Role;
  actual?: string;
}) {
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <div className='max-w-sm space-y-3 text-center'>
        <div className='bg-muted mx-auto flex size-11 items-center justify-center rounded-full'>
          <IconLock className='text-muted-foreground size-5' />
        </div>
        <p className='font-medium'>
          This section needs the {ROLE_LABEL[required]} role
        </p>
        <p className='text-muted-foreground text-sm'>
          You&apos;re signed in as{' '}
          {actual ? (ROLE_LABEL[actual as Role] ?? actual) : 'an unknown role'}.
          Ask a superadmin if you need access.
        </p>
      </div>
    </div>
  );
}
