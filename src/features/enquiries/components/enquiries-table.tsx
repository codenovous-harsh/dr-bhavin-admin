'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
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
import { formatDate } from '@/lib/format-date';
import enquiryService from '@/services/enquiry.service';
import type { Enquiry, EnquiryStatus } from '@/types/enquiry';

// 'Spam' is deliberately not offered here. It has its own toolbar toggle, and
// the API leaves spam out of the unfiltered queue, so exposing it as a fourth
// status would give two controls the same job — and let them disagree, e.g. a
// "Closed" chip left showing over a list of spam, with no obvious winner.
// Staff can still MOVE an enquiry to spam; that list lives in the row action.
const STATUS_OPTIONS: { label: string; value: EnquiryStatus }[] = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Closed', value: 'closed' }
];

// Bulk actions DO offer 'spam', unlike the column filter above. Filtering by it
// is the toggle's job; moving rows into it is a legitimate action, and it is
// also the route to giving junk a retention date so it clears itself.
const BULK_STATUS_OPTIONS: { label: string; value: EnquiryStatus }[] = [
  ...STATUS_OPTIONS,
  { label: 'Spam', value: 'spam' }
];

const STATUS_CLASS: Record<string, string> = {
  new: 'border-primary/50 bg-primary/10 text-foreground border',
  contacted: 'border-warning/50 bg-warning/10 text-foreground border',
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

export function EnquiriesTable({
  refreshToken,
  renderActions
}: {
  refreshToken?: unknown;
  renderActions?: (enquiry: Enquiry) => React.ReactNode;
}) {
  // Bumped after this component's own mutations. Folded into the same key the
  // parent's refreshToken feeds, so a bulk action here and a row action in the
  // page above both land on one refetch path.
  const [localRefresh, setLocalRefresh] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  // In the URL like every other table control, so the spam view survives
  // reload, back/forward and being shared. nuqs removes the param entirely when
  // set to null, which keeps the default URL clean.
  const [showSpam, setShowSpam] = useQueryState(
    'spam',
    parseAsBoolean.withDefault(false)
  );
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // Lets staff see whether the spam view is worth opening without opening it.
  // Re-read on refreshToken so reclassifying a row updates the badge. Failure
  // is swallowed on purpose: the count is an affordance, and losing it should
  // never take the table down with it.
  const [spamCount, setSpamCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    enquiryService
      .getStats()
      .then((s) => {
        if (!cancelled) setSpamCount(s.counts.spam);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshToken, localRefresh]);

  const columns = React.useMemo<ColumnDef<Enquiry>[]>(
    () => [
      {
        id: 'select',
        // Selection is per page. The server paginates, so rows on other pages
        // are not in the client's row model and cannot be selected from here —
        // hence "on this page" rather than a plain "select all", which would
        // imply a reach it does not have.
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
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.name}</span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Name',
          variant: 'text',
          placeholder: 'Search name, email or concern…'
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
        id: 'concern',
        accessorKey: 'concern',
        header: 'Concern',
        cell: ({ row }) => row.original.concern || '—',
        enableSorting: false,
        meta: { label: 'Concern' }
      },
      {
        id: 'sourceTitle',
        accessorKey: 'sourceTitle',
        header: 'Enquired from',
        cell: ({ row }) => (
          <span className='text-muted-foreground line-clamp-1'>
            {row.original.sourceTitle || row.original.sourcePath || '—'}
          </span>
        ),
        enableSorting: false,
        meta: { label: 'Enquired from' }
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const s = row.original.status ?? 'new';
          return (
            <Badge className={STATUS_CLASS[s] ?? STATUS_CLASS.new}>{s}</Badge>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        meta: { label: 'Status', variant: 'select', options: STATUS_OPTIONS }
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Received' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground tabular-nums'>
            {formatDate(row.original.createdAt)}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Received' }
      },
      ...(renderActions
        ? [
            {
              id: 'actions',
              header: '',
              enableSorting: false,
              enableHiding: false,
              cell: ({ row }) => renderActions(row.original)
            } as ColumnDef<Enquiry>
          ]
        : [])
    ],
    [renderActions]
  );

  const { table, loading, error } = useServerTable<Enquiry>({
    columns,
    searchColumnId: 'name',
    // showSpam has to ride along here. The hook's fetch effect depends on
    // [queryKey, refreshToken] and deliberately excludes `fetcher`, so flipping
    // the toggle would otherwise change the closure without triggering a
    // refetch and the list would silently stay as it was.
    refreshToken: `${String(refreshToken)}:${showSpam}:${localRefresh}`,
    fetcher: async (q) => {
      const data = await enquiryService.list({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        // The spam view forces the status; otherwise an absent status means
        // "the queue", which the API already reads as everything but spam.
        status: showSpam
          ? 'spam'
          : (q.filters.status as EnquiryStatus | undefined)
      });
      return { rows: data.enquiries, total: data.pagination.total };
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original._id);
  // Surfaced in the delete confirmation. Deleting spam is routine; deleting a
  // real enquiry is not, and the dialog should say so rather than treating both
  // the same.
  const nonSpamSelected = selectedRows.filter(
    (r) => r.original.status !== 'spam'
  ).length;

  const afterMutation = React.useCallback(() => {
    table.resetRowSelection();
    setLocalRefresh((n) => n + 1);
  }, [table]);

  const applyBulkStatus = async (status: EnquiryStatus) => {
    setBusy(true);
    try {
      const r = await enquiryService.bulkUpdateStatus(selectedIds, status);
      // Reports what the server actually changed, not what was asked for: rows
      // can vanish between selecting and submitting.
      toast.success(`Moved ${r.modified} to ${status}`);
      afterMutation();
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not update those enquiries'));
    } finally {
      setBusy(false);
    }
  };

  const applyBulkDelete = async () => {
    setBusy(true);
    try {
      const r = await enquiryService.bulkRemove(selectedIds);
      toast.success(
        `Deleted ${r.deleted} ${r.deleted === 1 ? 'enquiry' : 'enquiries'}`
      );
      setConfirmOpen(false);
      afterMutation();
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not delete those enquiries'));
    } finally {
      setBusy(false);
    }
  };

  const toggleSpam = React.useCallback(() => {
    // Back to page 1: the two lists are unrelated lengths, so carrying page 3
    // across from the queue lands on an empty spam table that reads as a bug.
    setPage(1);
    // The status filter means nothing while status is forced, and a stale
    // "Closed" chip sitting above a list of spam is worse than no chip.
    table.getColumn('status')?.setFilterValue(undefined);
    // Selections do not carry across two unrelated lists.
    table.resetRowSelection();
    setShowSpam(showSpam ? null : true);
  }, [showSpam, setShowSpam, setPage, table]);

  const hasSelection = selectedIds.length > 0;

  return (
    <>
      <ServerDataTable
        table={table}
        loading={loading}
        error={error}
        columnCount={renderActions ? 8 : 7}
        toolbarActions={
          <>
            {hasSelection && (
              <>
                <span className='text-muted-foreground text-sm whitespace-nowrap'>
                  {selectedIds.length} selected
                </span>
                {/* Remounted on each mutation so the trigger falls back to its
                    placeholder instead of keeping the status just applied,
                    which would read as a filter rather than an action. */}
                <Select
                  key={localRefresh}
                  disabled={busy}
                  onValueChange={(v) => applyBulkStatus(v as EnquiryStatus)}
                >
                  <SelectTrigger
                    className='h-8 w-[150px]'
                    aria-label='Change status of selected'
                  >
                    <SelectValue placeholder='Change status' />
                  </SelectTrigger>
                  <SelectContent>
                    {BULK_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='destructive'
                  size='sm'
                  disabled={busy}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className='size-4' />
                  Delete
                </Button>
              </>
            )}
            <Button
              variant={showSpam ? 'default' : 'outline'}
              size='sm'
              onClick={toggleSpam}
              aria-pressed={showSpam}
              title={
                showSpam
                  ? 'Back to the enquiry queue'
                  : 'Show enquiries flagged as spam'
              }
            >
              <ShieldAlert className='size-4' />
              Spam
              {spamCount ? (
                <Badge variant='secondary' className='ml-1 px-1.5 tabular-nums'>
                  {spamCount}
                </Badge>
              ) : null}
            </Button>
          </>
        }
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'enquiry' : 'enquiries'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nonSpamSelected > 0 ? (
                <>
                  <strong>
                    {nonSpamSelected} of these {nonSpamSelected === 1 ? 'is' : 'are'} not
                    marked as spam
                  </strong>{' '}
                  and may be a real patient enquiry. Deleting is permanent and
                  cannot be undone — there is no trash to recover from.
                </>
              ) : (
                <>
                  This is permanent and cannot be undone. Spam is also removed
                  automatically after its retention window, so deleting by hand
                  is only needed to clear it sooner.
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
                // The dialog closes on click by default, which would dismiss it
                // before the request resolves and hide any failure.
                e.preventDefault();
                applyBulkDelete();
              }}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
