'use client';

import type { Table as TanstackTable } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';

interface ServerDataTableProps<TData> {
  table: TanstackTable<TData>;
  loading: boolean;
  error: string | null;
  /** Column count for the loading skeleton. */
  columnCount: number;
  /** Extra controls rendered inside the toolbar (e.g. an export button). */
  toolbarActions?: ReactNode;
}

/**
 * Standard shell for every server-driven table.
 *
 * Holds the three states each list page used to re-implement slightly
 * differently — loading, error, and the table itself — plus the toolbar that
 * exposes search and column filters. `min-h-0` matters: DataTable positions its
 * scroll container absolutely, so it needs a flex parent that is allowed to
 * shrink, otherwise the table grows past the viewport instead of scrolling.
 */
export function ServerDataTable<TData>({
  table,
  loading,
  error,
  columnCount,
  toolbarActions
}: ServerDataTableProps<TData>) {
  if (error) {
    return (
      <div className='border-destructive/40 bg-destructive/10 rounded-lg border p-6'>
        <p className='font-medium'>Could not load this list</p>
        <p className='text-muted-foreground mt-1 text-sm'>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={columnCount}
        rowCount={8}
        filterCount={1}
      />
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarActions}</DataTableToolbar>
    </DataTable>
  );
}
