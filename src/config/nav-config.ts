import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support.
 *
 * `access.role` is the minimum role required to see the item:
 *   - 'editor'     → editor, admin, superadmin
 *   - 'admin'      → admin, superadmin
 *   - 'superadmin' → superadmin only
 *
 * Items without `access.role` are visible to anyone authenticated.
 * Filtering is implemented in `useFilteredNavItems` (src/hooks/use-nav.ts).
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [],
    access: { role: 'admin' },
  },
  {
    title: 'Patients',
    url: '/dashboard/patients',
    icon: 'users',
    isActive: false,
    shortcut: ['p', 'p'],
    items: [],
    access: { role: 'admin' },
  },
  {
    title: 'Enquiries',
    url: '/dashboard/enquiries',
    icon: 'post',
    isActive: false,
    shortcut: ['e', 'n'],
    items: [],
    access: { role: 'editor' },
  },
  {
    title: 'AI Prompts',
    url: '/dashboard/prompts',
    icon: 'settings',
    isActive: false,
    shortcut: ['a', 'i'],
    items: [],
    access: { role: 'admin' },
  },
  {
    title: 'Blogs',
    url: '/dashboard/blogs',
    icon: 'blog',
    isActive: false,
    shortcut: ['b', 'b'],
    items: [],
    access: { role: 'editor' },
  },
  {
    title: 'Clinical Research',
    url: '/dashboard/research',
    icon: 'post',
    isActive: false,
    shortcut: ['r', 'r'],
    items: [],
    access: { role: 'editor' },
  },
  {
    title: 'Contacts',
    url: '/dashboard/contacts',
    icon: 'users',
    isActive: false,
    shortcut: ['c', 'c'],
    items: [],
    access: { role: 'editor' },
  },
  {
    title: 'User Management',
    url: '/dashboard/users',
    icon: 'user',
    isActive: false,
    shortcut: ['u', 'u'],
    items: [],
    access: { role: 'superadmin' },
  },
];
