'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { notifyQueueCountsChanged } from '@/hooks/use-unread-counts';
import { formatDate, formatDuration } from '@/lib/format-date';
import skinAnalysisService from '@/services/skinAnalysis.service';
import { toast } from 'sonner';
import type { FollowUpStatus, SkinAnalysis } from '@/types/skinAnalysis';

const STATUS_OPTIONS = [
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
];

/** Status tint + border; text stays a text token so it never relies on colour. */
const STATUS_CLASS: Record<string, string> = {
  completed: 'border-success/50 bg-success/10 text-foreground border',
  processing: 'border-warning/50 bg-warning/10 text-foreground border',
  pending: 'border-warning/50 bg-warning/10 text-foreground border',
  failed: 'border-destructive/50 bg-destructive/10 text-foreground border'
};

// Same set + colours as the Enquiries follow-up column, so the two queues
// read identically. Unlike Enquiries, 'spam' is not split out into its own
// toggle here — a full skin-analysis submission (photos + consent) is much
// less likely to be junk, so one plain filterable list covers it.
const FOLLOW_UP_OPTIONS: { label: string; value: FollowUpStatus }[] = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Booked', value: 'booked' },
  { label: 'Closed', value: 'closed' },
  { label: 'Spam', value: 'spam' }
];

const FOLLOW_UP_CLASS: Record<string, string> = {
  new: 'border-primary/50 bg-primary/10 text-foreground border',
  contacted: 'border-warning/50 bg-warning/10 text-foreground border',
  booked: 'border-chart-2/50 bg-chart-2/10 text-foreground border',
  closed: 'border-success/50 bg-success/10 text-foreground border',
  spam: 'border-border bg-muted text-muted-foreground border'
};

/** Pulls the API's message out of an axios error, falling back sensibly. */
function errorMessage(e: unknown, fallback: string) {
  return (
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    (e as Error)?.message ??
    fallback
  );
}

export function PatientsDataTable({
  refreshToken,
  renderActions
}: {
  refreshToken?: unknown;
  renderActions?: (analysis: SkinAnalysis) => React.ReactNode;
}) {
  // Bumped after this component's own bulk mutations, folded into the same
  // refresh key the parent's refreshToken feeds — see EnquiriesTable, same
  // reasoning.
  const [localRefresh, setLocalRefresh] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const columns = React.useMemo<ColumnDef<SkinAnalysis>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label='Select all rows on this page'
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label='Select row'
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36
      },
      {
        id: 'firstName',
        accessorKey: 'firstName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Patient' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Patient',
          variant: 'text',
          placeholder: 'Search name or email…'
        }
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Email' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground'>{row.original.email}</span>
        ),
        enableSorting: true,
        meta: { label: 'Email' }
      },
      {
        id: 'age',
        accessorKey: 'age',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Age' />
        ),
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.age ?? '—'}</span>
        ),
        enableSorting: true,
        meta: { label: 'Age' }
      },
      {
        // Renamed from "Status" to "Analysis" now that the table also has a
        // "Follow-up" column — this one is the AI pipeline state and stays
        // exactly as it was.
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Analysis' />
        ),
        cell: ({ row }) => {
          const s = row.original.status ?? 'pending';
          return (
            <Badge className={STATUS_CLASS[s] ?? STATUS_CLASS.pending}>
              {s}
            </Badge>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        meta: { label: 'Analysis', variant: 'select', options: STATUS_OPTIONS }
      },
      {
        id: 'followUpStatus',
        accessorKey: 'followUpStatus',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Follow-up' />
        ),
        cell: ({ row }) => {
          const s = row.original.followUpStatus ?? 'new';
          return (
            <Badge className={FOLLOW_UP_CLASS[s] ?? FOLLOW_UP_CLASS.new}>
              {s}
            </Badge>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Follow-up',
          variant: 'select',
          options: FOLLOW_UP_OPTIONS
        }
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Submitted' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground tabular-nums'>
            {formatDate(row.original.createdAt)}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Submitted' }
      },
      {
        // Sorts server-side on timings.totalMs — the point of the column is
        // "show me the slowest runs", which paging through by date cannot do.
        id: 'timings.totalMs',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Duration' />
        ),
        cell: ({ row }) => {
          const ms = row.original.timings?.totalMs;
          if (ms == null) {
            return <span className='text-muted-foreground'>—</span>;
          }
          return (
            <span
              className='tabular-nums'
              title={
                row.original.status === 'failed'
                  ? 'Time spent before this run failed'
                  : undefined
              }
            >
              {formatDuration(ms)}
            </span>
          );
        },
        enableSorting: true,
        meta: { label: 'Duration' }
      },
      {
        id: 'view',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant='ghost' size='sm'>
            <Link href={`/dashboard/patients/${row.original._id}`}>View</Link>
          </Button>
        )
      },
      ...(renderActions
        ? [
            {
              id: 'actions',
              header: '',
              enableSorting: false,
              enableHiding: false,
              cell: ({ row }) => renderActions(row.original)
            } as ColumnDef<SkinAnalysis>
          ]
        : [])
    ],
    [renderActions]
  );

  const { table, loading, error } = useServerTable<SkinAnalysis>({
    columns,
    searchColumnId: 'firstName',
    refreshToken: `${String(refreshToken)}:${localRefresh}`,
    fetcher: async (q) => {
      const res = await skinAnalysisService.getAllAnalyses({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        status: q.filters.status as SkinAnalysis['status'],
        followUpStatus: q.filters.followUpStatus as FollowUpStatus | undefined
      });
      return {
        rows: res.data.analyses,
        total: res.data.pagination.total ?? 0
      };
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original._id);
  const hasSelection = selectedIds.length > 0;

  const applyBulkStatus = async (status: FollowUpStatus) => {
    setBusy(true);
    try {
      const r = await skinAnalysisService.bulkUpdateFollowUpStatus(selectedIds, status);
      toast.success(`Moved ${r.modified} to ${status}`);
      table.resetRowSelection();
      setLocalRefresh((n) => n + 1);
      // Bulk actions live here, not on the page, so nothing else would know
      // the counts moved — the cards above and the sidebar badge both listen.
      notifyQueueCountsChanged();
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not update those submissions'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ServerDataTable
      table={table}
      loading={loading}
      error={error}
      columnCount={renderActions ? 10 : 9}
      toolbarActions={
        hasSelection ? (
          <>
            <span className='text-muted-foreground text-sm whitespace-nowrap'>
              {selectedIds.length} selected
            </span>
            {/* Remounted on each mutation so the trigger falls back to its
                placeholder instead of keeping the status just applied, which
                would read as a filter rather than an action. */}
            <Select
              key={localRefresh}
              disabled={busy}
              onValueChange={(v) => applyBulkStatus(v as FollowUpStatus)}
            >
              <SelectTrigger
                className='h-8 w-[150px]'
                aria-label='Change follow-up status of selected'
              >
                <SelectValue placeholder='Change status' />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : undefined
      }
    />
  );
}
