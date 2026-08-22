'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { formatDate, formatDuration } from '@/lib/format-date';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type { SkinAnalysis } from '@/types/skinAnalysis';

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

export function PatientsDataTable() {
  const columns = React.useMemo<ColumnDef<SkinAnalysis>[]>(
    () => [
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
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
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
        meta: { label: 'Status', variant: 'select', options: STATUS_OPTIONS }
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
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant='ghost' size='sm'>
            <Link href={`/dashboard/patients/${row.original._id}`}>View</Link>
          </Button>
        )
      }
    ],
    []
  );

  const { table, loading, error } = useServerTable<SkinAnalysis>({
    columns,
    searchColumnId: 'firstName',
    fetcher: async (q) => {
      const res = await skinAnalysisService.getAllAnalyses({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        status: q.filters.status as SkinAnalysis['status']
      });
      return {
        rows: res.data.analyses,
        total: res.data.pagination.total ?? 0
      };
    }
  });

  return (
    <ServerDataTable
      table={table}
      loading={loading}
      error={error}
      columnCount={7}
    />
  );
}
