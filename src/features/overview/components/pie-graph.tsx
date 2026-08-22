'use client';

import * as React from 'react';
import { IconCircleCheck } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

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
import dashboardService from '@/services/dashboard.service';

/**
 * Completed / Pending / Failed encode STATE, not series identity, so they wear
 * the reserved status tokens rather than categorical slots — a status colour
 * must never impersonate a series. Each slice is labelled, which is also the
 * mitigation for `warning` sitting below 3:1 on the light surface.
 */
const chartConfig = {
  value: { label: 'Submissions' },
  Completed: { label: 'Completed', color: 'var(--success)' },
  Pending: { label: 'Pending', color: 'var(--warning)' },
  Failed: { label: 'Failed', color: 'var(--critical)' }
} satisfies ChartConfig;

const STATUS_FILL: Record<string, string> = {
  Completed: 'var(--success)',
  Pending: 'var(--warning)',
  Failed: 'var(--critical)',
  Processing: 'var(--serious)'
};

export function PieGraph() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getStatusDistribution();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching status distribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSubmissions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const completedCount = chartData.find((item) => item.name === 'Completed')?.value || 0;
  const completedPercentage = totalSubmissions > 0
    ? ((completedCount / totalSubmissions) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <Card className='@container/card animate-pulse'>
        <CardHeader>
          <div className='h-6 w-48 bg-muted rounded'></div>
          <div className='h-4 w-64 bg-muted rounded mt-2'></div>
        </CardHeader>
        <CardContent>
          <div className='h-[250px] bg-muted rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Submission Status Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Analysis submission status breakdown
          </span>
          <span className='@[540px]/card:hidden'>Status breakdown</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: STATUS_FILL[item.name] ?? 'var(--muted-foreground)'
              }))}
              dataKey='value'
              nameKey='name'
              innerRadius={60}
              // 2px surface-coloured ring so adjacent slices stay separable
              // without relying on hue alone.
              strokeWidth={2}
              stroke='var(--card)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalSubmissions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {completedPercentage}% successfully completed{' '}
          <IconCircleCheck className='h-4 w-4 text-success' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Real-time submission status
        </div>
      </CardFooter>
    </Card>
  );
}
