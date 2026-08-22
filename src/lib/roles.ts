/**
 * Role hierarchy — single source of truth.
 *
 * IMPORTANT: everything in this file is PRESENTATION ONLY.
 *
 * The role is read from `localStorage.user`, which the user can edit, so none
 * of it is a security boundary. It exists so people are shown a clean "you
 * don't have access" screen instead of a page that renders and then fills with
 * 403 toasts, and so the nav only offers what you can actually use.
 *
 * Enforcement lives on the backend, which is where it is real:
 *   dr-bhavin-garara-backend/src/middleware/auth.middleware.js
 *     - protect            verifies the JWT signature
 *     - authorize(...roles) checks the role claim inside it
 * Verified behaviour (no token / editor / admin / superadmin):
 *   /api/auth/users                401 / 403 / 403 / 200   (superadmin only)
 *   /api/prompts                   401 / 403 / 200 / 200   (admin+)
 *   /api/skin-analysis/admin/all   401 / 403 / 200 / 200   (admin+)
 *   /api/skin-analysis/user/:email 401 / 403 / 200 / 200   (admin+)
 *
 * If you add a role-gated screen here, add the matching `authorize()` on the
 * backend route too — this file alone protects nothing.
 */

export type Role = 'user' | 'editor' | 'admin' | 'superadmin';

const ROLE_RANK: Record<string, number> = {
  user: 0,
  editor: 1,
  admin: 2,
  superadmin: 3
};

/** Does `userRole` meet or exceed `requiredRole`? */
export function rolePermits(userRole?: string, requiredRole?: string): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[requiredRole] ?? 99);
}

export const ROLE_LABEL: Record<Role, string> = {
  user: 'User',
  editor: 'Editor',
  admin: 'Admin',
  superadmin: 'Superadmin'
};
