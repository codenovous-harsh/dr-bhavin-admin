'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

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
      <StatusSelect
        enquiry={enquiry}
        onChanged={() => setRefreshToken((n) => n + 1)}
      />
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
