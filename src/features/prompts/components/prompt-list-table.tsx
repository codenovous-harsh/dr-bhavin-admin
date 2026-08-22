'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { formatDate } from '@/lib/format-date';
import promptService from '@/services/prompt.service';
import type { PromptTemplate } from '@/types/prompt';

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
];

const statusBadge: Record<string, string> = {
  draft: 'border border-warning/50 bg-warning/10 text-foreground',
  published: 'border border-success/50 bg-success/10 text-foreground',
  archived: 'border border-border bg-muted text-muted-foreground'
};

export function PromptListTable() {
  const router = useRouter();
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const refresh = () => setRefreshToken((n) => n + 1);

  const act = React.useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      setBusy(true);
      try {
        await fn();
        toast.success(label);
        refresh();
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? `Could not ${label.toLowerCase()}`;
        toast.error(msg);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const columns = React.useMemo<ColumnDef<PromptTemplate>[]>(
    () => [
      {
        id: 'version',
        accessorKey: 'version',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Version' />
        ),
        cell: ({ row }) => (
          <span className='font-medium tabular-nums'>
            v{row.original.version}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Version' }
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => (
          <Badge className={statusBadge[row.original.status] ?? ''}>
            {row.original.status}
          </Badge>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        meta: { label: 'Status', variant: 'select', options: STATUS_OPTIONS }
      },
      {
        id: 'notes',
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <span className='text-muted-foreground line-clamp-1'>
            {row.original.notes || '—'}
          </span>
        ),
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
          label: 'Notes',
          variant: 'text',
          placeholder: 'Search notes…'
        }
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Created' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground tabular-nums'>
            {formatDate(row.original.createdAt)}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Created' }
      },
      {
        id: 'publishedAt',
        accessorKey: 'publishedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Published' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground tabular-nums'>
            {formatDate(row.original.publishedAt)}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Published' }
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className='flex justify-end gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push(`/dashboard/prompts/${r._id}`)}
              >
                {r.status === 'draft' ? 'Edit' : 'View'}
              </Button>
              {r.status === 'draft' && (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    disabled={busy}
                    onClick={() =>
                      act('Prompt published', () => promptService.publish(r._id))
                    }
                  >
                    Publish
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:text-destructive'
                    disabled={busy}
                    onClick={() => {
                      // Destructive and irreversible — keep the confirmation
                      // the previous table had.
                      if (
                        !window.confirm(
                          `Delete draft v${r.version}? This cannot be undone.`
                        )
                      )
                        return;
                      void act('Prompt deleted', () =>
                        promptService.remove(r._id)
                      );
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          );
        }
      }
    ],
    [router, act, busy]
  );

  const { table, loading, error } = useServerTable<PromptTemplate>({
    columns,
    searchColumnId: 'notes',
    refreshToken,
    fetcher: async (q) => {
      const data = await promptService.list({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        status: q.filters.status
      });
      return { rows: data.items, total: data.pagination.total };
    }
  });

  const handleNewDraft = async () => {
    setBusy(true);
    try {
      // Seed from the published version, fetched explicitly.
      //
      // This used to clone from whatever was in the loaded `rows` array. Now
      // that the table only holds one page, the published version may not be on
      // screen — the draft would silently seed from the wrong prompt (or an
      // empty one) depending on the page and sort you happened to be viewing.
      const seed = await promptService.getPublished();
      const created = await promptService.create({
        name: 'skin-analysis',
        systemPrompt: seed?.systemPrompt ?? '',
        userPromptTemplate: seed?.userPromptTemplate ?? '',
        notes: seed ? `Cloned from v${seed.version}` : ''
      });
      router.push(`/dashboard/prompts/${created._id}`);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not create draft';
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <PageContainer
      pageTitle='AI Prompts'
      pageDescription='Versioned prompts that generate patient skin-analysis reports.'
      pageHeaderAction={
        <Button onClick={handleNewDraft} disabled={busy}>
          New Draft
        </Button>
      }
    >
      <ServerDataTable
        table={table}
        loading={loading}
        error={error}
        columnCount={6}
      />
    </PageContainer>
  );
}
