import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  /**
   * Opens a row. Optional — tables that do not pass it behave exactly as
   * before, with no cursor change and no handler attached.
   *
   * Clicks landing on something interactive are ignored, so a selection
   * checkbox, status dropdown or delete button still does its own job rather
   * than also opening the row. Detected by ancestor lookup, not by comparing
   * event targets, because the click usually lands on an icon or label inside
   * the control rather than the control itself.
   */
  onRowClick?: (row: TData) => void;
}

/** Controls that should swallow the click instead of opening the row. */
const INTERACTIVE =
  'button, a, input, select, textarea, label, [role="checkbox"], [role="combobox"], [role="menuitem"], [data-no-row-click]';

export function DataTable<TData>({
  table,
  actionBar,
  onRowClick,
  children
}: DataTableProps<TData>) {
  return (
    <div className='flex flex-col gap-4'>
      {children}
      {/*
        Normal document flow, not `absolute inset-0`.

        The original positioned the scroll container absolutely inside a
        `flex-1` parent, which only works when an ancestor has a definite
        height. Rendered inside PageContainer (a normal column within the
        scrolling <main>), flex-1 had nothing to fill and the table collapsed to
        0px — toolbar and pagination visible, no rows. Vertical scrolling is the
        page's job; this only owns horizontal overflow for wide tables.
      */}
      <div className='overflow-hidden rounded-lg border'>
        <ScrollArea className='w-full'>
          <Table>
              <TableHeader className='bg-muted sticky top-0 z-10'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column })
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      {...(onRowClick
                        ? {
                            onClick: (
                              e: React.MouseEvent<HTMLTableRowElement>
                            ) => {
                              if ((e.target as HTMLElement).closest(INTERACTIVE))
                                return;
                              // Don't hijack a text selection being made.
                              if (window.getSelection()?.toString()) return;
                              onRowClick(row.original);
                            },
                            // Keyboard parity — a row that only opens on click
                            // cannot be reached without a mouse.
                            tabIndex: 0,
                            onKeyDown: (
                              e: React.KeyboardEvent<HTMLTableRowElement>
                            ) => {
                              if (e.target !== e.currentTarget) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(row.original);
                              }
                            },
                            className:
                              'cursor-pointer focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2'
                          }
                        : {})}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column })
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
          </Table>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
