'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';

export const DEFAULT_PAGE_SIZE = 15;

/** Everything the server needs to return one page of a table. */
export interface ServerTableQuery {
  page: number;
  limit: number;
  /** '-field' for descending, 'field' for ascending. Whitelisted server-side. */
  sortBy?: string;
  /** Free-text term, mapped from the designated search column. */
  search?: string;
  /** Remaining column filters, keyed by column id (e.g. status, role). */
  filters: Record<string, string>;
}

export interface ServerTableResult<TData> {
  rows: TData[];
  total: number;
}

interface UseServerTableOptions<TData> {
  columns: ColumnDef<TData>[];
  /** Fetches exactly one page. Must respect every field of the query. */
  fetcher: (
    query: ServerTableQuery,
    signal: AbortSignal
  ) => Promise<ServerTableResult<TData>>;
  /**
   * Column id whose filter value is sent as `search` rather than as a named
   * filter. Usually the name/email column.
   */
  searchColumnId?: string;
  pageSize?: number;
  /** Bump to force a refetch (e.g. after a mutation). */
  refreshToken?: unknown;
}

/**
 * Server-driven table: pagination, sorting and filtering all happen in the API.
 *
 * Every table in the admin used to fetch its whole collection and slice it in
 * the browser, which meant the row count was bounded by whatever the endpoint's
 * default limit happened to be, and sorting only ever reordered the page you
 * had. Here the URL is the source of truth (via `useDataTable` + nuqs), each
 * change produces a new query, and the server returns one page.
 *
 * Because state lives in the URL it survives reload, back/forward and sharing —
 * and `useDataTable` already debounces filter typing before it reaches the URL,
 * so this does not need its own debounce.
 */
export function useServerTable<TData>({
  columns,
  fetcher,
  searchColumnId,
  pageSize = DEFAULT_PAGE_SIZE,
  refreshToken
}: UseServerTableOptions<TData>) {
  const [rows, setRows] = React.useState<TData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Read the live page size from the URL rather than using the `pageSize`
  // default. Deriving pageCount from the default meant that changing rows-per-
  // page left the count stale — at 2 per page with 6 rows the footer read
  // "Page 1 of 1" and the next-page button did nothing, because it computed
  // ceil(6 / 15). Same key `useDataTable` writes, so the two stay in step, and
  // reading it here avoids the chicken-and-egg of needing table state to build
  // the options that create the table.
  const [perPage] = useQueryState(
    'perPage',
    parseAsInteger.withDefault(pageSize)
  );
  const pageCount = Math.max(1, Math.ceil(total / (perPage || pageSize)));

  const { table } = useDataTable<TData>({
    data: rows,
    columns,
    pageCount,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    getRowId: (row, index) =>
      (row as { _id?: string; id?: string })._id ??
      (row as { id?: string }).id ??
      String(index)
  });

  const state = table.getState();

  // Serialise the query so the effect fires on *value* changes, not on the new
  // object identity that TanStack produces every render.
  const query = React.useMemo<ServerTableQuery>(() => {
    const sort = state.sorting[0];
    const filters: Record<string, string> = {};
    let search: string | undefined;

    for (const f of state.columnFilters) {
      const value = Array.isArray(f.value) ? f.value.join(',') : String(f.value);
      if (!value) continue;
      if (f.id === searchColumnId) search = value;
      else filters[f.id] = value;
    }

    return {
      page: state.pagination.pageIndex + 1,
      limit: state.pagination.pageSize,
      sortBy: sort ? `${sort.desc ? '-' : ''}${sort.id}` : undefined,
      search,
      filters
    };
  }, [
    state.pagination.pageIndex,
    state.pagination.pageSize,
    state.sorting,
    state.columnFilters,
    searchColumnId
  ]);

  const queryKey = JSON.stringify(query);

  React.useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcher(JSON.parse(queryKey) as ServerTableQuery, controller.signal)
      .then((res) => {
        if (!active) return;
        setRows(res.rows);
        setTotal(res.total);
      })
      .catch((e: unknown) => {
        if (!active || controller.signal.aborted) return;
        const message =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ??
          (e as Error)?.message ??
          'Failed to load';
        setError(message);
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      // Cancels in-flight requests so fast typing can't land out of order.
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, refreshToken]);

  return { table, rows, total, pageCount, loading, error };
}
