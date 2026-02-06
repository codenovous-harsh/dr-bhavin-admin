'use client';

import { IconTrendingUp, IconChartLine } from '@tabler/icons-react';
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
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

// Mock data for visualization - will be replaced with real time-series data
const chartData = [
  { date: 'Week 1', completed: 12, pending: 8 },
  { date: 'Week 2', completed: 18, pending: 6 },
  { date: 'Week 3', completed: 24, pending: 5 },
  { date: 'Week 4', completed: 30, pending: 7 },
  { date: 'Week 5', completed: 35, pending: 4 },
  { date: 'Week 6', completed: 42, pending: 9 }
];

const chartConfig = {
  submissions: {
    label: 'Submissions'
  },
  completed: {
    label: 'Completed',
    color: 'hsl(142, 76%, 36%)' // green
  },
  pending: {
    label: 'Pending',
    color: 'hsl(48, 96%, 53%)' // yellow
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Submission Trends</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Weekly submission status trends (sample data)
          </span>
          <span className='@[540px]/card:hidden'>Weekly trends</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                  stopColor='hsl(142, 76%, 36%)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='hsl(142, 76%, 36%)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillPending' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='hsl(48, 96%, 53%)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='hsl(48, 96%, 53%)'
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
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey='pending'
              type='monotone'
              fill='url(#fillPending)'
              stroke='hsl(48, 96%, 53%)'
              strokeWidth={2}
              stackId='1'
            />
            <Area
              dataKey='completed'
              type='monotone'
              fill='url(#fillCompleted)'
              stroke='hsl(142, 76%, 36%)'
              strokeWidth={2}
              stackId='1'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 font-medium leading-none'>
              Sample trend data <IconChartLine className='h-4 w-4' />
            </div>
            <div className='flex items-center gap-2 leading-none text-muted-foreground'>
              Historical time-series data coming soon
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
