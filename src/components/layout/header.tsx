import React from 'react';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { ModeToggle } from './ThemeToggle/theme-toggle';

/**
 * App header.
 *
 * Fixed 56px. It previously carried
 * `group-has-data-[collapsible=icon]/sidebar-wrapper:h-12`, which shrank it from
 * 64px to 48px whenever the sidebar collapsed — every page's content jumped on
 * a nav toggle, and no single height could satisfy the `calc()` that
 * PageContainer used to do. The height is now constant and the content area
 * flexes, so there is no magic number to keep in sync.
 *
 * The GitHub CTA (which pointed at the upstream template repo) and the second
 * user menu (a duplicate of the sidebar footer's, with its own storage read and
 * its own sign-out handler) have both been removed.
 */
export default function Header() {
  return (
    <header className='bg-background flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4'>
      <div className='flex min-w-0 items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-1 h-4' />
        <Breadcrumbs />
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <SearchInput />
        <ModeToggle />
      </div>
    </header>
  );
}
