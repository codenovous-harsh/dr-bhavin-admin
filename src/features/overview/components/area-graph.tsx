'use client';

import { IconTrendingUp, IconChartLine } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

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
};

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Submission Trends</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Showing submission trends over the past 6 weeks
          </span>
          <span className='@[540px]/card:hidden'>Past 6 weeks</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg'>
          <div className='text-center space-y-4'>
            <div className='grid grid-cols-2 gap-4 max-w-md mx-auto'>
              <div className='p-4 bg-background rounded-lg border'>
                <div className='text-sm text-muted-foreground mb-1'>Total Completed</div>
                <div className='text-2xl font-bold text-green-600'>
                  {chartData.reduce((sum, item) => sum + item.completed, 0)}
                </div>
              </div>
              <div className='p-4 bg-background rounded-lg border'>
                <div className='text-sm text-muted-foreground mb-1'>Total Pending</div>
                <div className='text-2xl font-bold text-yellow-600'>
                  {chartData.reduce((sum, item) => sum + item.pending, 0)}
                </div>
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-4'>
              Chart visualization temporarily disabled for bundle size optimization
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 font-medium leading-none'>
              Trending up by 15% this month <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='flex items-center gap-2 leading-none text-muted-foreground'>
              Based on recent submission data
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
