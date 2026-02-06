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

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-1))'
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
          {
            category: 'Published',
            count: data.published,
            fill: 'hsl(142, 76%, 36%)' // green
          },
          {
            category: 'Drafts',
            count: data.drafts,
            fill: 'hsl(48, 96%, 53%)' // yellow
          },
          {
            category: 'Featured',
            count: data.featured,
            fill: 'hsl(217, 91%, 60%)' // blue
          }
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
          <div className='h-6 w-48 bg-gray-200 rounded'></div>
          <div className='h-4 w-64 bg-gray-200 rounded mt-2'></div>
        </CardHeader>
        <CardContent>
          <div className='h-[300px] bg-gray-200 rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Blog Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Blog Performance</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Overview of blog posts by status
          </span>
          <span className='@[540px]/card:hidden'>Blog status overview</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 sm:px-6'>
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
            <defs>
              {chartData.map((item) => (
                <linearGradient
                  key={item.category}
                  id={`fill${item.category}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='0%' stopColor={item.fill} stopOpacity={0.9} />
                  <stop offset='100%' stopColor={item.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
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
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey='count'
              radius={[8, 8, 0, 0]}
              fill='url(#fillPublished)'
            >
              {chartData.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey='count'
                  fill={`url(#fill${entry.category})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
