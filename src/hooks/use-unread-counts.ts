'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { useCurrentUser } from '@/hooks/use-current-user';
import { rolePermits } from '@/lib/roles';
import enquiryService from '@/services/enquiry.service';
import skinAnalysisService from '@/services/skinAnalysis.service';

/**
 * How often the counts are re-read. Long enough not to hammer the API from
 * every open tab, short enough that two people working the same queue see
 * each other's progress without reloading.
 */
const POLL_MS = 45_000;

/** Nav urls the counts are keyed by, so the sidebar can look them up by item.url. */
export const ENQUIRIES_URL = '/dashboard/enquiries';
export const PATIENTS_URL = '/dashboard/patients';

/**
 * Fired whenever something changes a queue's status counts.
 *
 * The mutations happen in several places that do not share a parent — a row
 * dropdown on the page, a bulk action inside the table, a delete — and two
 * unrelated consumers need to react: the per-status cards above each list and
 * the sidebar badge. Threading callbacks between them all would mean prop
 * drilling through components that otherwise have no reason to know about
 * each other, so they meet on one event instead.
 */
export const QUEUE_COUNTS_CHANGED = 'queue-counts-changed';

/** Call after any mutation that can move a row between statuses. */
export function notifyQueueCountsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(QUEUE_COUNTS_CHANGED));
  }
}

/**
 * Unactioned ("new") counts per queue, for the sidebar badges.
 *
 * Both queues use the same rule: a row counts until someone moves it off
 * 'new' — contacted, booked, closed or spam all clear it.
 *
 * Every failure is swallowed deliberately. The badge is an affordance; losing
 * it must never take the navigation down with it.
 */
export function useUnreadCounts(): Record<string, number> {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const role = user?.role;

  const [counts, setCounts] = React.useState<Record<string, number>>({});

  // Both endpoints are role-gated on the backend, so asking without the role
  // would just collect 403s. Enquiries is editor+, scans are admin+.
  const canSeeEnquiries = rolePermits(role, 'editor');
  const canSeePatients = rolePermits(role, 'admin');

  React.useEffect(() => {
    // Role resolves a tick after mount (it is read from localStorage); until
    // then there is nothing worth asking for.
    if (!role) return;

    let cancelled = false;

    const read = async () => {
      const [enquiries, scans] = await Promise.all([
        canSeeEnquiries
          ? enquiryService
              .getStats()
              .then((s) => s.counts.new)
              .catch(() => null)
          : Promise.resolve(null),
        canSeePatients
          ? skinAnalysisService
              .getAnalysisStats()
              .then((r) => r.data.followUpCounts?.new ?? 0)
              .catch(() => null)
          : Promise.resolve(null)
      ]);

      if (cancelled) return;

      setCounts((prev) => ({
        ...prev,
        ...(enquiries !== null ? { [ENQUIRIES_URL]: enquiries } : {}),
        ...(scans !== null ? { [PATIENTS_URL]: scans } : {})
      }));
    };

    read();
    const timer = setInterval(read, POLL_MS);
    // Someone on this screen just triaged a row — reflect it now rather than
    // leaving a stale badge until the next tick.
    window.addEventListener(QUEUE_COUNTS_CHANGED, read);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(QUEUE_COUNTS_CHANGED, read);
    };
    // pathname is a dependency on purpose: leaving a queue you have just
    // triaged should update its badge immediately rather than at the next tick.
  }, [role, canSeeEnquiries, canSeePatients, pathname]);

  return counts;
}
