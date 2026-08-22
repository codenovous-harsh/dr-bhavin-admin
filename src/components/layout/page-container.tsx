import React from 'react';
import { Heading } from '../ui/heading';

/**
 * The single page shell. Every dashboard page should render through this.
 *
 * Two things changed from the previous version:
 *
 * 1. No scroll container of its own. It used to wrap children in a ScrollArea
 *    fixed at `h-[calc(100dvh-52px)]` while the dashboard layout ALSO had an
 *    `overflow-y-auto` wrapper — two nested scrollers, and the header is 56px,
 *    never the 52px the calc assumed. Scrolling now belongs to exactly one
 *    element, in `dashboard/layout.tsx`.
 *
 * 2. The page header is only rendered when there is something to put in it.
 *    An unconditional `<Heading title='' description='' />` plus `mb-4` used to
 *    reserve empty space above every page that didn't pass a title.
 *
 * Pages previously hand-rolled five different wrappers
 * (`flex-1 space-y-4 p-4 pt-6 md:p-8`, `space-y-6 p-4 md:p-6`,
 * `container mx-auto p-6`, `flex flex-col gap-4 p-4 md:p-6`, and this one),
 * so padding and rhythm changed as you clicked between nav items.
 */
export default function PageContainer({
  children,
  isloading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  pageHeaderAction
}: {
  children: React.ReactNode;
  /** @deprecated Scrolling is owned by the dashboard layout. */
  scrollable?: boolean;
  isloading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: React.ReactNode;
}) {
  if (!access) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const hasHeader = Boolean(pageTitle || pageDescription || pageHeaderAction);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
      {hasHeader && (
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <Heading
            title={pageTitle ?? ''}
            description={pageDescription ?? ''}
          />
          {pageHeaderAction}
        </div>
      )}
      {isloading ? <PageSkeleton /> : children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-40 w-full rounded-lg' />
      <div className='bg-muted h-40 w-full rounded-lg' />
    </div>
  );
}
