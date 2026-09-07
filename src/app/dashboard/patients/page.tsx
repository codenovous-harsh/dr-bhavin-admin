'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { StatusStatsRow } from '@/components/status-stats-row';
import {
  QUEUE_COUNTS_CHANGED,
  notifyQueueCountsChanged
} from '@/hooks/use-unread-counts';
import PatientStatsCards from '@/features/skinAnalysis/components/patient-stats-cards';
import { PatientsDataTable } from '@/features/skinAnalysis/components/patients-data-table';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type { FollowUpStatus, SkinAnalysis, SkinAnalysisStats } from '@/types/skinAnalysis';

const FOLLOW_UP_STATUSES: FollowUpStatus[] = ['new', 'contacted', 'booked', 'closed', 'spam'];

const FOLLOW_UP_STATS_ITEMS = [
  { key: 'new', label: 'New', dotClass: 'bg-primary' },
  { key: 'contacted', label: 'Contacted', dotClass: 'bg-warning' },
  { key: 'booked', label: 'Booked', dotClass: 'bg-chart-2' },
  { key: 'closed', label: 'Closed', dotClass: 'bg-success' },
  { key: 'spam', label: 'Spam', dotClass: 'bg-muted-foreground' }
];

export default function PatientsPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [stats, setStats] = useState<SkinAnalysisStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Driven by the shared event rather than by refreshToken: the bulk action
  // lives inside PatientsDataTable and never touches this component's state,
  // so a token dependency here would miss it and leave the cards stale until
  // a manual reload.
  useEffect(() => {
    let cancelled = false;

    const read = () => {
      skinAnalysisService
        .getAnalysisStats()
        .then((res) => {
          if (!cancelled) setStats(res.data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setStatsLoading(false);
        });
    };

    read();
    window.addEventListener(QUEUE_COUNTS_CHANGED, read);
    return () => {
      cancelled = true;
      window.removeEventListener(QUEUE_COUNTS_CHANGED, read);
    };
  }, []);

  // Bumping refreshToken refetches the rows; the event refreshes the cards
  // above and the sidebar badge.
  const handleRowMutated = useCallback(() => {
    setRefreshToken((n) => n + 1);
    notifyQueueCountsChanged();
  }, []);

  const renderActions = useCallback(
    (analysis: SkinAnalysis) => (
      <FollowUpStatusSelect analysis={analysis} onChanged={handleRowMutated} />
    ),
    [handleRowMutated]
  );

  return (
    <PageContainer
      pageTitle='Patients'
      pageDescription='Skin analysis submissions and their results.'
    >
      <PatientStatsCards />
      <StatusStatsRow
        items={FOLLOW_UP_STATS_ITEMS}
        counts={stats?.followUpCounts ?? null}
        loading={statsLoading}
      />
      <PatientsDataTable refreshToken={refreshToken} renderActions={renderActions} />
    </PageContainer>
  );
}

function FollowUpStatusSelect({
  analysis,
  onChanged
}: {
  analysis: SkinAnalysis;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const change = async (status: FollowUpStatus) => {
    setBusy(true);
    try {
      await skinAnalysisService.updateFollowUpStatus(analysis._id, status);
      toast.success(`Marked as ${status}`);
      // Refetch rather than patching local state: with a follow-up filter
      // active, the row may no longer belong on this page at all.
      onChanged();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not update status';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Select
      value={analysis.followUpStatus}
      onValueChange={(v) => change(v as FollowUpStatus)}
      disabled={busy}
    >
      <SelectTrigger className='h-8 w-[130px]' aria-label='Change follow-up status'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FOLLOW_UP_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className='capitalize'>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
