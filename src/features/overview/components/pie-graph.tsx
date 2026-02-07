'use client';

import * as React from 'react';
import { IconCircleCheck } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import dashboardService from '@/services/dashboard.service';

const chartConfig = {
  value: {
    label: 'Submissions'
  },
  completed: {
    label: 'Completed',
    color: 'hsl(142, 76%, 36%)' // green
  },
  pending: {
    label: 'Pending',
    color: 'hsl(48, 96%, 53%)' // yellow
  },
  failed: {
    label: 'Failed',
    color: 'hsl(0, 84%, 60%)' // red
  }
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
          <div className='h-6 w-48 bg-gray-200 rounded'></div>
          <div className='h-4 w-64 bg-gray-200 rounded mt-2'></div>
        </CardHeader>
        <CardContent>
          <div className='h-[250px] bg-gray-200 rounded'></div>
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
      <CardContent>
        <div className='h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg'>
          <div className='text-center space-y-4'>
            <div className='grid grid-cols-1 gap-3 max-w-xs mx-auto'>
              {chartData.map((item) => (
                <div key={item.name} className='flex items-center justify-between p-3 bg-background rounded-lg border'>
                  <div className='text-sm font-medium'>{item.name}</div>
                  <div className='flex items-center gap-2'>
                    <div className='text-lg font-bold'>{item.value}</div>
                    <div className='text-sm text-muted-foreground'>
                      ({((item.value / totalSubmissions) * 100).toFixed(0)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className='text-xs text-muted-foreground mt-4'>
              Chart visualization temporarily disabled for bundle size optimization
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 font-medium leading-none'>
          Completed: {completedPercentage}% <IconCircleCheck className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>
          Total submissions: {totalSubmissions}
        </div>
      </CardFooter>
    </Card>
  );
}
