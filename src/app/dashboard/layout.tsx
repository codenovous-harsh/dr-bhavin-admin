import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { RouteRoleGuard } from '@/components/layout/route-role-guard';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persist the sidebar state across reloads.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <KBar>
      <SidebarProvider
        defaultOpen={defaultOpen}
        suppressHydrationWarning
        // 3.5rem rail (up from the 3rem default) so a 40px nav button sits with
        // an even 8px gutter either side once SidebarGroup's padding is taken
        // off. The button size in app-sidebar.tsx is matched to this.
        style={{ '--sidebar-width-icon': '3.5rem' } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset className='flex h-svh min-w-0 flex-col overflow-hidden'>
          <Header />
          {/*
              The one and only scroll container. PageContainer used to nest a
              second, height-calculated ScrollArea inside this, which produced
              either a double scrollbar or a dead strip depending on the sidebar
              state. `min-h-0` is what lets a flex child actually scroll instead
              of growing past its parent.
            */}
          <main className='min-h-0 flex-1 overflow-y-auto'>
            <RouteRoleGuard>{children}</RouteRoleGuard>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
