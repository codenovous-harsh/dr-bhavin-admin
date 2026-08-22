'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import enquiryService, { type EnquiryStats } from '@/services/enquiry.service';

/**
 * "Which pages bring people in?"
 *
 * Enquiries record the page title they were submitted from, so this is direct
 * marketing attribution — the closest thing the app has to a revenue signal,
 * and nothing surfaced it before.
 *
 * Horizontal bars: the labels are full page titles and would be unreadable
 * rotated under a vertical axis.
 */
const chartConfig = {
  count: {
    label: 'Enquiries',
    // One series of nominal categories, so every bar wears the same slot-1 hue.
    // Colouring each bar differently would spend the identity channel
    // re-encoding what the bar length already shows.
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

/** Page titles are suffixed with the site name; it's noise repeated on every row. */
function tidy(label: string) {
  return label.replace(/\s*\|\s*Dr Bhavin Garara\s*$/i, '').trim() || label;
}

export function EnquirySources() {
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
            ?.message ?? 'Could not load enquiry sources'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <Skeleton className='h-6 w-56' />
          <Skeleton className='mt-2 h-4 w-64' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[260px] w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Where enquiries come from</CardTitle>
          <CardDescription className='text-destructive'>
            {error ?? 'No data available'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const data = stats.topSources.map((s) => ({
    label: tidy(s.label),
    count: s.count
  }));
  const total = data.reduce((a, b) => a + b.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));
  // Headroom so the longest bar stops short of the plot edge. Pinning the
  // domain exactly to the max made every bar run the full width, which read as
  // a progress meter rather than a chart — there was no visible scale left to
  // measure against.
  const axisMax = Math.max(2, Math.ceil(max * 1.3));

  // Height follows the row count so the rows read as a list, with a floor that
  // stops the card collapsing when only one or two pages have enquiries.
  const chartHeight = Math.max(180, data.length * 48 + 56);

  // The plot is width-capped (max-w-3xl below). In a full-width row a two-row
  // chart stretched its bars across the whole card, which read as progress
  // meters rather than a scale; capping keeps them proportionate and still
  // grows as more source pages appear.

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Where enquiries come from</CardTitle>
        <CardDescription>
          Pages that led to a consultation request · last {stats.windowDays} days
        </CardDescription>
      </CardHeader>

      <CardContent className='px-2 sm:px-6'>
        {data.length === 0 ? (
          <div className='text-muted-foreground flex h-[260px] items-center justify-center text-sm'>
            No enquiries with a recorded source yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='w-full max-w-3xl'
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout='vertical'
              margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray='3 3' opacity={0.4} />
              <XAxis
                type='number'
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                // Pin the domain to the real max. Recharts' auto domain padded
                // out to 4 when the largest value was 1, which made every bar
                // look like a stub.
                domain={[0, axisMax]}
                tickCount={Math.min(axisMax + 1, 6)}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type='category'
                dataKey='label'
                tickLine={false}
                axisLine={false}
                width={200}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey='count'
                fill='var(--color-count)'
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              >
                {/* Direct labels: with a handful of rows the value matters more
                    than reading it off the axis. Text stays a text token — the
                    bar carries identity, not the number. */}
                <LabelList
                  dataKey='count'
                  position='right'
                  offset={8}
                  className='fill-muted-foreground'
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className='text-muted-foreground text-sm'>
        {total} {total === 1 ? 'enquiry' : 'enquiries'} attributed to a page
      </CardFooter>
    </Card>
  );
}
