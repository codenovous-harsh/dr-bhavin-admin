'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import { EnquiriesTable } from '@/features/enquiries/components/enquiries-table';
import { EnquiryDetailSheet } from '@/features/enquiries/components/enquiry-detail-sheet';
import enquiryService, { type EnquiryStats } from '@/services/enquiry.service';
import type { Enquiry, EnquiryStatus } from '@/types/enquiry';

const STATUSES: EnquiryStatus[] = ['new', 'contacted', 'booked', 'closed', 'spam'];

const STATS_ITEMS = [
  { key: 'new', label: 'New', dotClass: 'bg-primary' },
  { key: 'contacted', label: 'Contacted', dotClass: 'bg-warning' },
  { key: 'booked', label: 'Booked', dotClass: 'bg-chart-2' },
  { key: 'closed', label: 'Closed', dotClass: 'bg-success' },
  { key: 'spam', label: 'Spam', dotClass: 'bg-muted-foreground' }
];

export default function EnquiriesPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const refresh = useCallback(() => setRefreshToken((n) => n + 1), []);
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Driven by the shared event rather than by refreshToken: the bulk actions
  // live inside EnquiriesTable and never touch this component's state, so a
  // token dependency here would miss them and leave the cards stale until a
  // manual reload.
  useEffect(() => {
    let cancelled = false;

    const read = () => {
      enquiryService
        .getStats()
        .then((s) => {
          if (!cancelled) setStats(s);
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
    (enquiry: Enquiry) => (
      <div className='flex items-center gap-1'>
        <StatusSelect enquiry={enquiry} onChanged={handleRowMutated} />
        <DeleteRowButton enquiry={enquiry} onDeleted={handleRowMutated} />
      </div>
    ),
    [handleRowMutated]
  );

  return (
    <PageContainer
      pageTitle='Enquiries'
      pageDescription='Consultation requests submitted from the website.'
    >
      <StatusStatsRow
        items={STATS_ITEMS}
        counts={stats?.counts ?? null}
        loading={statsLoading}
      />
      <EnquiriesTable
        refreshToken={refreshToken}
        renderActions={renderActions}
        onOpen={setOpenId}
      />

      <EnquiryDetailSheet
        enquiryId={openId}
        open={openId !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        onChanged={refresh}
      />
    </PageContainer>
  );
}

/** Pulls the API's message out of an axios error, falling back sensibly. */
function errorMessage(e: unknown, fallback: string) {
  return (
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    (e as Error)?.message ??
    fallback
  );
}

function DeleteRowButton({
  enquiry,
  onDeleted
}: {
  enquiry: Enquiry;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSpam = enquiry.status === 'spam';

  const remove = async () => {
    setBusy(true);
    try {
      await enquiryService.remove(enquiry._id);
      toast.success('Enquiry deleted');
      setOpen(false);
      onDeleted();
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not delete this enquiry'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant='ghost'
        size='icon'
        className='text-muted-foreground hover:text-destructive size-8'
        onClick={() => setOpen(true)}
        aria-label={`Delete enquiry from ${enquiry.name}`}
      >
        <Trash2 className='size-4' />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
          <AlertDialogDescription>
            {enquiry.name} &lt;{enquiry.email}&gt;.{' '}
            {isSpam ? (
              <>
                This is permanent. Spam is also removed automatically after its
                retention window, so deleting by hand only clears it sooner.
              </>
            ) : (
              <>
                <strong>This is not marked as spam</strong> and may be a real
                patient enquiry. Deletion is permanent and cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className='bg-destructive hover:bg-destructive/90 text-white'
            onClick={(e) => {
              // Without this the dialog dismisses on click, hiding any failure.
              e.preventDefault();
              remove();
            }}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StatusSelect({
  enquiry,
  onChanged
}: {
  enquiry: Enquiry;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const change = async (status: EnquiryStatus) => {
    setBusy(true);
    try {
      await enquiryService.updateStatus(enquiry._id, status);
      toast.success(`Marked as ${status}`);
      // Refetch rather than patching local state: with a status filter active,
      // the row may no longer belong on this page at all.
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
      value={enquiry.status}
      onValueChange={(v) => change(v as EnquiryStatus)}
      disabled={busy}
    >
      <SelectTrigger className='h-8 w-[130px]' aria-label='Change status'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className='capitalize'>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
