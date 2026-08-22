'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type { SkinAnalysisStats } from '@/types/skinAnalysis';

export default function PatientStatsCards() {
  const [stats, setStats] = useState<SkinAnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await skinAnalysisService.getAnalysisStats();
        setStats(response.data);
      } catch (err: any) {
        // Check if it's an authorization error
        if (err.response?.status === 403) {
          setError('You do not have permission to view statistics. Please contact an administrator.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load statistics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error || 'Failed to load stats'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Submissions',
      value: stats.totalAnalyses,
      icon: Icons.users,
      description: 'All skin analysis submissions',
    },
    {
      title: 'Completed',
      value: stats.completedAnalyses,
      icon: Icons.dashboard,
      description: 'Successfully analyzed',
    },
    {
      title: 'Pending/Processing',
      value: stats.pendingAnalyses,
      icon: Icons.add,
      description: 'Awaiting AI analysis',
    },
    {
      title: 'Failed',
      value: stats.failedAnalyses,
      icon: Icons.close,
      description: 'Require manual review',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
