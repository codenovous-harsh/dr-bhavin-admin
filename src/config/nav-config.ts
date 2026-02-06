import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Patients',
    url: '/dashboard/patients',
    icon: 'users',
    isActive: false,
    shortcut: ['p', 'p'],
    items: []
  },
  // {
  //   title: 'Treatments',
  //   url: '/dashboard/treatments',
  //   icon: 'health',
  //   isActive: false,
  //   shortcut: ['t', 't'],
  //   items: []
  // },
  {
    title: 'Blogs',
    url: '/dashboard/blogs',
    icon: 'blog',
    isActive: false,
    shortcut: ['b', 'b'],
    items: []
  },
  // {
  //   title: 'Account',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'account',
  //   isActive: false,
  //   items: [
  //     {
  //       title: 'Profile',
  //       url: '/dashboard/profile',
  //       icon: 'profile',
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'Settings',
  //       url: '/dashboard/settings',
  //       icon: 'settings',
  //       shortcut: ['s', 's']
  //     }
  //   ]
  // }
];
