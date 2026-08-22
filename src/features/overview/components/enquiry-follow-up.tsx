'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import enquiryService, { type EnquiryStats } from '@/services/enquiry.service';

/**
 * "Who still needs calling?"
 *
 * Replaces the Status Distribution donut, which restated the stat cards using
 * system states (completed / failed) rather than answering a question anyone
 * would act on. An enquiry sitting on `new` is an un-contacted lead, so the
 * headline is the backlog and the age of the oldest one — the number that
 * actually costs money if it grows.
 *
 * Deliberately not a chart: three counts and one alert read faster as text, and
 * a donut of 3 slices tells you less than the numbers do.
 */
export function EnquiryFollowUp() {
  const [stats, setStats] = React.useState<EnquiryStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    enquiryService
      .getStats()
      .then(setStats)
      .catch((e) =>
        setError(
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'Could not load enquiry stats'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <Skeleton className='h-6 w-56' />
          <Skeleton className='mt-2 h-4 w-40' />
        </CardHeader>
        <CardContent className='space-y-3'>
          <Skeleton className='h-12 w-24' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Enquiries needing follow-up</CardTitle>
          <CardDescription className='text-destructive'>
            {error ?? 'No data available'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { counts, awaitingFollowUp, oldestUnactioned } = stats;
  const clear = awaitingFollowUp === 0;

  return (
    <Card className='@container/card flex flex-col'>
      <CardHeader>
        <CardTitle>Enquiries needing follow-up</CardTitle>
        <CardDescription>Consultation requests not yet contacted</CardDescription>
      </CardHeader>

      {/* flex-1 so the card fills its grid row and the footer link sits at the
          bottom, level with the chart beside it. */}
      <CardContent className='flex-1 space-y-5'>
        <div className='flex items-baseline gap-3'>
          <span className='text-4xl font-semibold tabular-nums'>
            {awaitingFollowUp}
          </span>
          <span className='text-muted-foreground text-sm'>
            {awaitingFollowUp === 1 ? 'awaiting a reply' : 'awaiting replies'}
          </span>
        </div>

        <dl className='grid grid-cols-3 gap-3 text-sm'>
          <Stat label='New' value={counts.new} tone='warning' />
          <Stat label='Contacted' value={counts.contacted} />
          <Stat label='Closed' value={counts.closed} tone='success' />
        </dl>

        {oldestUnactioned ? (
          <div className='border-warning/50 bg-warning/10 flex items-start gap-2.5 rounded-lg border p-3'>
            <IconAlertTriangle className='text-warning mt-0.5 size-4 shrink-0' />
            <div className='min-w-0 text-sm'>
              <p className='font-medium'>
                Oldest is {oldestUnactioned.ageDays}{' '}
                {oldestUnactioned.ageDays === 1 ? 'day' : 'days'} old
              </p>
              <p className='text-muted-foreground truncate'>
                {oldestUnactioned.name} · {oldestUnactioned.email}
              </p>
            </div>
          </div>
        ) : (
          clear && (
            <div className='border-success/50 bg-success/10 flex items-center gap-2.5 rounded-lg border p-3 text-sm'>
              <IconCircleCheck className='text-success size-4 shrink-0' />
              <span>Everything has been followed up.</span>
            </div>
          )
        )}
      </CardContent>

      <CardFooter>
        <Button asChild variant='ghost' size='sm' className='-ml-2'>
          <Link href='/dashboard/enquiries?status=new'>
            Open enquiries
            <IconArrowRight className='ml-1 size-4' />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone?: 'warning' | 'success';
}) {
  return (
    <div className='space-y-1'>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='flex items-center gap-1.5 font-medium tabular-nums'>
        {/* Tint marks state; the label carries the meaning, never colour alone. */}
        {tone && (
          <span
            aria-hidden
            className={
              tone === 'warning'
                ? 'bg-warning size-2 rounded-full'
                : 'bg-success size-2 rounded-full'
            }
          />
        )}
        {value}
      </dd>
    </div>
  );
}
