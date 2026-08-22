'use client';

import * as React from 'react';
import { IconTrendingDown, IconTrendingUp, IconMinus } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import dashboardService, {
  type SubmissionTrends
} from '@/services/dashboard.service';


const chartConfig = {
  submissions: {
    label: 'Submissions'
  },
  // State, not series identity -> reserved status tokens.
  completed: {
    label: 'Completed',
    color: 'var(--success)'
  },
  pending: {
    label: 'Pending',
    color: 'var(--warning)'
  }
} satisfies ChartConfig;

const DAYS = 30;

/** "17 Aug" — short enough to fit 30 daily ticks without rotating. */
const axisFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/London'
});
const tooltipFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/London'
});
const formatAxisDay = (iso: string) => axisFmt.format(new Date(iso));
const formatTooltipDay = (iso: unknown) =>
  typeof iso === 'string' ? tooltipFmt.format(new Date(iso)) : String(iso);

export function AreaGraph() {
  const [trends, setTrends] = React.useState<SubmissionTrends | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    dashboardService
      .getSubmissionTrends(DAYS)
      .then(setTrends)
      .catch((e) =>
        setError(
          e?.response?.data?.message || 'Could not load submission trends'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='mt-2 h-4 w-64' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[250px] w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error || !trends) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Skin analyses over time</CardTitle>
          <CardDescription className='text-destructive'>
            {error ?? 'No trend data available'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = trends.points;
  const hasAny = chartData.some((p) => p.total > 0);
  const { changePct, current, previous } = trends.delta;

  return (
    <Card className='@container/card flex flex-col'>
      <CardHeader>
        <CardTitle>Skin analyses over time</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            People who completed the online skin analysis · last {DAYS} days
          </span>
          <span className='@[540px]/card:hidden'>
            Skin analyses · last {DAYS} days
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillCompleted' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--success)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--success)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillPending' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--warning)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--warning)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' vertical={false} opacity={0.3} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              minTickGap={28}
              tickFormatter={formatAxisDay}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={formatTooltipDay} />}
            />
            {/* Two series stacked in the same space are unreadable without a
                key; identity must never rest on colour alone. */}
            <ChartLegend content={<ChartLegendContent />} />
            {/* linear, not monotone: these are discrete weekly counts. A
                monotone spline draws a smooth ramp between buckets and
                overshoots, implying growth that happened between weeks when
                the data only exists at week boundaries. */}
            <Area
              dataKey='pending'
              type='linear'
              fill='url(#fillPending)'
              stroke='var(--warning)'
              strokeWidth={2}
              stackId='1'
            />
            <Area
              dataKey='completed'
              type='linear'
              fill='url(#fillCompleted)'
              stroke='var(--success)'
              strokeWidth={2}
              stackId='1'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='grid gap-1.5 text-sm'>
          <div className='flex items-center gap-2 leading-none font-medium'>
            {changePct === null ? (
              <>
                <IconMinus className='size-4' />
                No earlier period to compare
              </>
            ) : changePct >= 0 ? (
              <>
                <IconTrendingUp className='text-success size-4' />
                Up {changePct}% vs the previous 7 days
              </>
            ) : (
              <>
                <IconTrendingDown className='text-destructive size-4' />
                Down {Math.abs(changePct)}% vs the previous 7 days
              </>
            )}
          </div>
          <div className='text-muted-foreground leading-none'>
            {current} analyses in the last 7 days vs {previous} the week before
            {!hasAny && ` · no submissions in the last ${DAYS} days`}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
