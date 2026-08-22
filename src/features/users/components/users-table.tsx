'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ServerDataTable } from '@/components/ui/table/server-data-table';
import { useServerTable } from '@/hooks/use-server-table';
import { ROLE_LABEL, type Role } from '@/lib/roles';
import { formatDate } from '@/lib/format-date';
import userService from '@/services/user.service';
import type { User } from '@/services/auth.service';
import { IconDotsVertical } from '@tabler/icons-react';

const ROLE_OPTIONS = (['user', 'editor', 'admin', 'superadmin'] as Role[]).map(
  (r) => ({ label: ROLE_LABEL[r], value: r })
);

export function UsersTable({
  refreshToken,
  onChanged
}: {
  refreshToken: unknown;
  onChanged: () => void;
}) {
  const columns = React.useMemo<ColumnDef<User>[]>(
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
        // This column's filter is sent as `search` (see searchColumnId below),
        // so it queries name OR email server-side.
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
        id: 'role',
        accessorKey: 'role',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Role' />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary' className='capitalize'>
            {ROLE_LABEL[row.original.role as Role] ?? row.original.role}
          </Badge>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        meta: { label: 'Role', variant: 'select', options: ROLE_OPTIONS }
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge className='border-success/50 bg-success/10 text-foreground border'>
              Active
            </Badge>
          ) : (
            <Badge className='border-border bg-muted text-muted-foreground border'>
              Inactive
            </Badge>
          ),
        enableSorting: true,
        meta: { label: 'Status' }
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
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <RowActions user={row.original} onChanged={onChanged} />
        )
      }
    ],
    [onChanged]
  );

  const { table, loading, error } = useServerTable<User>({
    columns,
    searchColumnId: 'name',
    refreshToken,
    fetcher: async (q) => {
      const data = await userService.listUsers({
        page: q.page,
        limit: q.limit,
        sortBy: q.sortBy,
        search: q.search,
        role: q.filters.role
      });
      return { rows: data.users, total: data.pagination.total };
    }
  });

  return (
    <ServerDataTable
      table={table}
      loading={loading}
      error={error}
      columnCount={6}
    />
  );
}

function RowActions({
  user,
  onChanged
}: {
  user: User;
  onChanged: () => void;
}) {
  const [busy, setBusy] = React.useState(false);

  // Superadmins are not editable or deletable from the UI, matching the
  // previous table which hid every action on those rows.
  if (user.role === 'superadmin') {
    return <span className='text-muted-foreground text-xs'>Protected</span>;
  }

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      onChanged();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? `Could not ${label.toLowerCase()}`;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8'
          disabled={busy}
          aria-label={`Actions for ${user.name}`}
        >
          <IconDotsVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {(['editor', 'admin'] as const).map((role) => (
          <DropdownMenuItem
            key={role}
            disabled={user.role === role}
            onClick={() =>
              run(`Role set to ${ROLE_LABEL[role]}`, () =>
                userService.updateUser(user.id, { role })
              )
            }
          >
            Make {ROLE_LABEL[role]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            run(user.isActive ? 'User deactivated' : 'User activated', () =>
              userService.updateUser(user.id, { isActive: !user.isActive })
            )
          }
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onClick={() =>
            run('User deleted', () =>
              userService.deleteUser(user.id, { hard: true })
            )
          }
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
