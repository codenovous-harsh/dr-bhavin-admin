'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
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
 * Published / Drafts / Featured are NOMINAL categories of a single series
 * (a count), so every bar wears the same slot-1 hue. Colouring each bar
 * differently would spend the identity channel re-encoding what the bar
 * length already shows — and with one series there is no legend to read.
 *
 * `color` was previously `hsl(var(--chart-1))`, which is the pre-v4 shadcn
 * format: --chart-1 is already a complete colour, so that wrapper produced
 * `hsl(#27a48c)` — invalid, and silently no colour at all.
 */
const chartConfig = {
  count: {
    label: 'Posts',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getBlogPerformance();

        setChartData([
          { category: 'Published', count: data.published },
          { category: 'Drafts', count: data.drafts },
          { category: 'Featured', count: data.featured }
        ]);
      } catch (error) {
        console.error('Error fetching blog performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className='@container/card animate-pulse'>
        <CardHeader>
          <div className='h-6 w-48 bg-muted rounded'></div>
          <div className='h-4 w-64 bg-muted rounded mt-2'></div>
        </CardHeader>
        <CardContent>
          <div className='h-[300px] bg-muted rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className='@container/card flex flex-col'>
        <CardHeader>
          <CardTitle>Blog Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='@container/card flex flex-col'>
      <CardHeader>
        <CardTitle>Blog Performance</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Overview of blog posts by status
          </span>
          <span className='@[540px]/card:hidden'>Blog status overview</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 px-2 sm:px-6'>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' opacity={0.3} />
            <XAxis
              dataKey='category'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
              content={<ChartTooltipContent hideLabel />}
            />
            {/* One <Bar>, one fill. This previously nested a <Bar> per row
                INSIDE the outer <Bar> — not a valid Recharts child, so the
                per-category fills never applied anyway. */}
            <Bar
              dataKey='count'
              radius={[6, 6, 0, 0]}
              fill='var(--color-count)'
              maxBarSize={72}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
