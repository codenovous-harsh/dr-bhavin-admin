'use client';

import { IconSearch } from '@tabler/icons-react';
import { useKBar } from 'kbar';
import { Button } from './ui/button';

/**
 * Opens the KBar command palette.
 *
 * Below `md` this collapses to an icon button rather than disappearing — the
 * full box used to be `hidden md:flex`, which left mobile with no discoverable
 * way to search at all (⌘K only helps if you have a keyboard).
 */
export default function SearchInput() {
  const { query } = useKBar();

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        aria-label='Search'
        className='size-8 md:hidden'
        onClick={query.toggle}
      >
        <IconSearch className='size-4' />
      </Button>

      <Button
        variant='outline'
        onClick={query.toggle}
        className='text-muted-foreground hidden h-8 w-48 justify-start gap-2 pr-2 text-sm font-normal shadow-none md:inline-flex lg:w-64'
      >
        <IconSearch className='size-4 shrink-0' />
        <span className='truncate'>Search…</span>
        <kbd className='bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 shrink-0 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium select-none'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </>
  );
}
