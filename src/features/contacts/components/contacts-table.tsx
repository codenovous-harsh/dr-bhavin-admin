'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { formatDate } from '@/lib/format-date';
import contactService, { type Contact } from '@/services/contact.service';

export function ContactsTable({
  refreshToken,
  renderActions
}: {
  refreshToken?: unknown;
  renderActions?: (contact: Contact) => React.ReactNode;
}) {
  const columns = React.useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.name || '—'}</span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Name',
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
        id: 'tags',
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) =>
          row.original.tags?.length ? (
            <div className='flex flex-wrap gap-1'>
              {row.original.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant='secondary'>
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            '—'
          ),
        enableSorting: false,
        meta: { label: 'Tags' }
      },
      {
        id: 'subscribed',
        accessorKey: 'subscribed',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Subscribed' />
        ),
        cell: ({ row }) =>
          row.original.subscribed ? (
            <Badge className='border-success/50 bg-success/10 text-foreground border'>
              Subscribed
            </Badge>
          ) : (
            <Badge className='border-border bg-muted text-muted-foreground border'>
              Unsubscribed
            </Badge>
          ),
        enableSorting: true,
        meta: { label: 'Subscribed' }
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Added' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground tabular-nums'>
            {formatDate(row.original.createdAt)}
          </span>
        ),
        enableSorting: true,
        meta: { label: 'Added' }
      },
      ...(renderActions
        ? [
            {
              id: 'actions',
              header: '',
              enableSorting: false,
              enableHiding: false,
              cell: ({ row }) => renderActions(row.original)
            } as ColumnDef<Contact>
          ]
        : [])
    ],
    [renderActions]
  );

  const { table, loading, error } = useServerTable<Contact>({
    columns,
    searchColumnId: 'name',
    refreshToken,
    fetcher: async (q) => {
      const data = await contactService.list({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search
      });
      return { rows: data.contacts, total: data.pagination.total };
    }
  });

  return (
    <ServerDataTable
      table={table}
      loading={loading}
      error={error}
      columnCount={renderActions ? 6 : 5}
    />
  );
}
