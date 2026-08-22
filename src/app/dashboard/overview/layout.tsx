import PageContainer from '@/components/layout/page-container';
import { DashboardStatsCards } from '@/features/overview/components/dashboard-stats-cards';
import React from 'react';

/**
 * Overview grid.
 *
 * Keeps the original two-up rhythm — a wide chart beside a narrow panel — which
 * read tidily because paired cards ended up the same height. An earlier pass
 * reordered these and pushed Blog Performance to a full-width row, where a
 * single small bar left most of the card empty and the rows went ragged.
 *
 *   1. Blog performance          ·  Recent submissions
 *   2. Skin analyses over time   ·  Enquiries needing follow-up
 *   3. Where enquiries come from  (full width — long page titles need the room)
 *
 * `[&>*]:h-full` makes each card fill its grid row, so the two cards in a row
 * always end level even when their content differs in height.
 */
export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats,
  enquiry_sources
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
  enquiry_sources: React.ReactNode;
}) {
  return (
    <PageContainer
      pageTitle='Hi, Welcome back 👋'
      pageDescription='Leads, skin analyses and content at a glance.'
    >
      <DashboardStatsCards />

      <div className='grid grid-cols-1 items-stretch gap-4 lg:grid-cols-7'>
        <div className='lg:col-span-4 [&>*]:h-full'>{bar_stats}</div>
        <div className='lg:col-span-3 [&>*]:h-full'>{sales}</div>

        <div className='lg:col-span-4 [&>*]:h-full'>{area_stats}</div>
        <div className='lg:col-span-3 [&>*]:h-full'>{pie_stats}</div>

        <div className='lg:col-span-7'>{enquiry_sources}</div>
      </div>
    </PageContainer>
  );
}
