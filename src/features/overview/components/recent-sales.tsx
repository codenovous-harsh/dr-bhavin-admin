'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import dashboardService from '@/services/dashboard.service';
import type { SkinAnalysis } from '@/types/skinAnalysis';

export function RecentSales() {
  const [submissions, setSubmissions] = React.useState<SkinAnalysis[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getRecentSubmissions(5);
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching recent submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      completed: 'default',
      pending: 'secondary',
      processing: 'outline',
      failed: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card className='h-full animate-pulse'>
        <CardHeader>
          <div className='h-6 w-48 bg-gray-200 rounded'></div>
          <div className='h-4 w-64 bg-gray-200 rounded mt-2'></div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex items-center gap-4'>
                <div className='h-9 w-9 bg-gray-200 rounded-full'></div>
                <div className='space-y-2 flex-1'>
                  <div className='h-4 w-32 bg-gray-200 rounded'></div>
                  <div className='h-3 w-48 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>
          {submissions.length > 0
            ? `Latest skin analysis submissions`
            : 'No submissions yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <p>No recent submissions to display</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {submissions.map((submission) => {
              const initials = `${submission.firstName[0]}${submission.lastName[0]}`.toUpperCase();
              return (
                <div key={submission._id} className='flex items-center gap-4'>
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-1 min-w-0'>
                    <p className='text-sm leading-none font-medium truncate'>
                      {submission.firstName} {submission.lastName}
                    </p>
                    <p className='text-muted-foreground text-xs truncate'>
                      {submission.email}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <Badge variant={getStatusColor(submission.status)} className='text-xs'>
                      {submission.status}
                    </Badge>
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(submission.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
