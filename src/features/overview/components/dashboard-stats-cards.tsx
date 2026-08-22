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
import {
  IconEye,
  IconFileCheck,
  IconFileText,
  IconMinus,
  IconTrendingDown,
  IconTrendingUp
} from '@tabler/icons-react';
import dashboardService, {
  type DashboardStats,
  type SubmissionTrends
} from '@/services/dashboard.service';

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<SubmissionTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
        // Trend is supplementary — a failure here must not blank the cards.
        dashboardService
          .getSubmissionTrends(6)
          .then(setTrends)
          .catch(() => setTrends(null));
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
              <div className='h-4 w-24 bg-muted rounded mb-2'></div>
              <div className='h-8 w-32 bg-muted rounded'></div>
            </CardHeader>
            <CardFooter>
              <div className='h-4 w-full bg-muted rounded'></div>
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
            <CardDescription className='text-destructive'>
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
            <DeltaBadge changePct={trends?.delta.changePct ?? null} />
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 font-medium'>
            {skinAnalysis.successRate}% analysed successfully
          </div>
          <div className='text-muted-foreground'>
            {trends
              ? `${trends.delta.current} in the last 7 days`
              : 'All-time skin analysis submissions'}
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
          <div className='line-clamp-1 flex items-center gap-2 font-medium'>
            <IconFileCheck className='text-success size-4' />
            Successfully analysed
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
          <div className='line-clamp-1 font-medium'>
            {blogs.featuredBlogs} featured{' '}
            {blogs.featuredBlogs === 1 ? 'post' : 'posts'}
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
          <div className='line-clamp-1 flex items-center gap-2 font-medium'>
            <IconEye className='size-4' />
            Average {blogs.avgViewsPerBlog} per post
          </div>
          <div className='text-muted-foreground'>
            Across all published posts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Period-over-period change for the submissions card.
 *
 * Renders "no comparison" rather than a number when there is no prior week —
 * the cards used to show a static ↗ on three of four tiles with no trend data
 * behind it at all, which read as growth that was never measured.
 */
function DeltaBadge({ changePct }: { changePct: number | null }) {
  if (changePct === null) {
    // Kept short: a longer label competes with the card title for width and
    // wraps "Total Submissions" onto two lines. The footer carries the detail.
    return (
      <Badge
        variant='outline'
        className='text-muted-foreground'
        title='No prior 7-day period to compare against'
      >
        <IconMinus className='size-3.5' />
        n/a
      </Badge>
    );
  }
  const up = changePct >= 0;
  return (
    <Badge variant='outline'>
      {up ? (
        <IconTrendingUp className='text-success size-3.5' />
      ) : (
        <IconTrendingDown className='text-destructive size-3.5' />
      )}
      {up ? '+' : ''}
      {changePct}%
    </Badge>
  );
}
