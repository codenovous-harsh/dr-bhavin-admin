'use client';

import { useCallback, useState } from 'react';
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
import { EnquiriesTable } from '@/features/enquiries/components/enquiries-table';
import enquiryService from '@/services/enquiry.service';
import type { Enquiry, EnquiryStatus } from '@/types/enquiry';

const STATUSES: EnquiryStatus[] = ['new', 'contacted', 'closed', 'spam'];

export default function EnquiriesPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  const renderActions = useCallback(
    (enquiry: Enquiry) => (
      <div className='flex items-center gap-1'>
        <StatusSelect
          enquiry={enquiry}
          onChanged={() => setRefreshToken((n) => n + 1)}
        />
        <DeleteRowButton
          enquiry={enquiry}
          onDeleted={() => setRefreshToken((n) => n + 1)}
        />
      </div>
    ),
    []
  );

  return (
    <PageContainer
      pageTitle='Enquiries'
      pageDescription='Consultation requests submitted from the website.'
    >
      <EnquiriesTable
        refreshToken={refreshToken}
        renderActions={renderActions}
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
