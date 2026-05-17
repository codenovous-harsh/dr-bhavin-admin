'use client';

/**
 * Client-side hook for filtering navigation items by user role.
 *
 * Reads the authenticated user from localStorage (set by AuthService on login)
 * and filters nav items whose `access.role` does not match.
 *
 * Role hierarchy: superadmin > admin > editor > user
 * - access.role === 'superadmin' → only superadmin
 * - access.role === 'admin' → admin and superadmin
 * - access.role === 'editor' → editor, admin, and superadmin
 * - no access.role → visible to everyone authenticated
 */

import { useEffect, useMemo, useState } from 'react';
import type { NavItem } from '@/types';

const ROLE_RANK: Record<string, number> = {
  user: 0,
  editor: 1,
  admin: 2,
  superadmin: 3,
};

function rolePermits(userRole: string | undefined, requiredRole: string | undefined): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[requiredRole] ?? 99);
}

export function useFilteredNavItems(items: NavItem[]) {
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserRole(parsed?.role);
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const required = (item.access as any)?.role as string | undefined;
      return rolePermits(userRole, required);
    });
  }, [items, userRole]);

  return filteredItems;
}
