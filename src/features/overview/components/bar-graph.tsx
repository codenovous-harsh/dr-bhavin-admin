'use client';

import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import dashboardService from '@/services/dashboard.service';

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
        <div className='h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-lg'>
          <div className='text-center space-y-4'>
            <div className='grid grid-cols-3 gap-4 max-w-md mx-auto'>
              {chartData.map((item) => (
                <div key={item.category} className='p-4 bg-background rounded-lg border'>
                  <div className='text-2xl font-bold'>{item.count}</div>
                  <div className='text-sm text-muted-foreground'>{item.category}</div>
                </div>
              ))}
            </div>
            <p className='text-sm text-muted-foreground'>
              Chart visualization temporarily disabled for bundle size optimization
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
