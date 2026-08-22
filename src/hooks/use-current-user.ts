'use client';

import { useEffect, useState } from 'react';

/**
 * The authenticated user, normalised.
 *
 * Single source of truth for the client-side user. `app-sidebar`, `user-nav`
 * and `use-nav` each used to read and re-shape `localStorage.user` themselves,
 * with three slightly different normalisations.
 *
 * `isLoading` is true until the mount effect has run. Consumers must render a
 * skeleton during that window rather than rendering nothing: reading storage in
 * a lazy `useState` initialiser instead would desync server and client HTML.
 */
export type CurrentUser = {
  id?: string;
  role?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl?: string;
};

function normalise(raw: string): CurrentUser | null {
  try {
    const u = JSON.parse(raw);
    const name: string = u.name || u.fullName || 'User';
    const [firstName, ...rest] = name.split(' ');
    return {
      id: u.id || u._id,
      role: u.role,
      fullName: name,
      firstName: firstName || 'User',
      lastName: rest.join(' '),
      emailAddresses: [{ emailAddress: u.email ?? '' }],
      imageUrl: u.avatar || u.imageUrl || undefined
    };
  } catch {
    // Corrupt payload — drop it so the next sign-in starts clean.
    localStorage.removeItem('user');
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    setUser(raw ? normalise(raw) : null);
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
