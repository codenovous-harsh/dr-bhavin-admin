'use client';

/**
 * Client-side hook for filtering navigation items
 *
 * This is a dummy implementation without authentication.
 * All navigation items are visible to all users.
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';

// Dummy user and organization data
const dummyUser = {
  id: '1',
  fullName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  imageUrl: null
};

const dummyOrganization = {
  id: '1',
  name: 'Bhavin Garara Corp',
  slug: 'bhavin-garara-corp'
};

const dummyMembership = {
  role: 'admin',
  permissions: ['*'] // All permissions for dummy admin
};

/**
 * Hook to filter navigation items (dummy implementation)
 *
 * @param items - Array of navigation items to filter
 * @returns All items (no filtering in dummy mode)
 */
export function useFilteredNavItems(items: NavItem[]) {
  // Dummy context with all permissions
  const accessContext = useMemo(() => {
    return {
      organization: dummyOrganization,
      user: dummyUser,
      permissions: dummyMembership.permissions,
      role: dummyMembership.role,
      hasOrg: true
    };
  }, []);

  // Return all items without filtering (dummy mode)
  const filteredItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      items: item.items // Keep all sub-items as well
    }));
  }, [items]);

  return filteredItems;
}
