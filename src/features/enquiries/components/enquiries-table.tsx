'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { formatDate } from '@/lib/format-date';
import enquiryService from '@/services/enquiry.service';
import type { Enquiry, EnquiryStatus } from '@/types/enquiry';

const STATUS_OPTIONS: { label: string; value: EnquiryStatus }[] = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Closed', value: 'closed' },
  { label: 'Spam', value: 'spam' }
];

const STATUS_CLASS: Record<string, string> = {
  new: 'border-primary/50 bg-primary/10 text-foreground border',
  contacted: 'border-warning/50 bg-warning/10 text-foreground border',
  closed: 'border-success/50 bg-success/10 text-foreground border',
  spam: 'border-border bg-muted text-muted-foreground border'
};

export function EnquiriesTable({
  refreshToken,
  renderActions
}: {
  refreshToken?: unknown;
  renderActions?: (enquiry: Enquiry) => React.ReactNode;
}) {
  const columns = React.useMemo<ColumnDef<Enquiry>[]>(
    () => [
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
    refreshToken,
    fetcher: async (q) => {
      const data = await enquiryService.list({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        status: q.filters.status as EnquiryStatus
      });
      return { rows: data.enquiries, total: data.pagination.total };
    }
  });

  return (
    <ServerDataTable
      table={table}
      loading={loading}
      error={error}
      columnCount={renderActions ? 7 : 6}
    />
  );
}
