'use client';

/**
 * Filters navigation items by the current user's role.
 *
 * Role hierarchy: superadmin > admin > editor > user
 * - access.role === 'superadmin' → only superadmin
 * - access.role === 'admin'      → admin and superadmin
 * - access.role === 'editor'     → editor, admin, and superadmin
 * - no access.role               → visible to everyone authenticated
 *
 * Returns `isLoading` alongside the items. Every nav entry is role-gated, so
 * before the role is known the filter legitimately matches nothing — callers
 * must show a skeleton for that window instead of rendering an empty nav, which
 * is what made the sidebar visibly pop in on every page load.
 *
 * Presentation only. See the note in `config/nav-config.ts`.
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { rolePermits } from '@/lib/roles';

export function useFilteredNavItems(items: NavItem[]) {
  const { user, isLoading } = useCurrentUser();

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        rolePermits(user?.role, (item.access as { role?: string })?.role)
      ),
    [items, user?.role]
  );

  return { items: filteredItems, isLoading };
}
