'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { IconTrendingUp, IconFileCheck, IconFileText, IconEye } from '@tabler/icons-react';
import dashboardService, { type DashboardStats } from '@/services/dashboard.service';

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card animate-pulse'>
            <CardHeader>
              <div className='h-4 w-24 bg-gray-200 rounded mb-2'></div>
              <div className='h-8 w-32 bg-gray-200 rounded'></div>
            </CardHeader>
            <CardFooter>
              <div className='h-4 w-full bg-gray-200 rounded'></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription className='text-red-600'>
              {error || 'Failed to load stats'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { skinAnalysis, blogs } = stats;

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Submissions */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Submissions</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {skinAnalysis.totalSubmissions.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp className='size-4' />
              {skinAnalysis.successRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Success rate {skinAnalysis.successRate}%{' '}
            <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            Skin analysis submissions
          </div>
        </CardFooter>
      </Card>

      {/* Completed Analyses */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Completed Analyses</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {skinAnalysis.completedAnalyses.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='default'>
              <IconFileCheck className='size-4' />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Successfully analyzed{' '}
            <IconFileCheck className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {skinAnalysis.pendingAnalyses} pending, {skinAnalysis.failedAnalyses} failed
          </div>
        </CardFooter>
      </Card>

      {/* Published Blogs */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Published Blogs</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {blogs.publishedBlogs.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconFileText className='size-4' />
              {blogs.draftBlogs} drafts
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {blogs.featuredBlogs} featured posts{' '}
            <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            Total {blogs.totalBlogs} blog posts
          </div>
        </CardFooter>
      </Card>

      {/* Total Views */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Views</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {blogs.totalViews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconEye className='size-4' />
              {blogs.avgViewsPerBlog} avg
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Average {blogs.avgViewsPerBlog} per blog{' '}
            <IconEye className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            Across all published posts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
