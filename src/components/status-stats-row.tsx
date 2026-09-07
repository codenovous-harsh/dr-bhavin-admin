'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StatusStatItem {
  /** Key into the `counts` record for this status. */
  key: string;
  label: string;
  /** Solid-color Tailwind class for the accent dot, e.g. 'bg-primary'. */
  dotClass: string;
}

interface StatusStatsRowProps {
  items: StatusStatItem[];
  counts: Record<string, number> | null;
  loading?: boolean;
}

/**
 * Small "where are we" row of per-status counts, shared by the Enquiries and
 * Patients (scans) list pages so both read the same way at a glance —
 * especially useful when more than one person is working through a queue.
 */
export function StatusStatsRow({ items, counts, loading }: StatusStatsRowProps) {
  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
      {items.map((item) => (
        <Card key={item.key}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{item.label}</CardTitle>
            <span className={`size-2.5 rounded-full ${item.dotClass}`} />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold tabular-nums'>
              {loading || !counts ? '—' : (counts[item.key] ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
