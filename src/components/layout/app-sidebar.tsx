'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/config/nav-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { authService } from '@/services/auth.service';
import {
  IconLogout,
  IconSelector,
  IconUserCircle
} from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

/** Fixed, uneven widths so the loading rail reads as text without randomness. */
const SKELETON_WIDTHS = ['72%', '58%', '80%', '64%', '76%', '54%'];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, isLoading } = useFilteredNavItems(navItems);
  const { user } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/auth/sign-in');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to logout';
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible='icon'>
      {/*
        Brand lockup: public/assets/Full.png, the same file in both themes.

        It is transparent apart from the teal mark and its pale halo, so it sits
        on the light and dark sidebar alike with no background panel.

        The supplied file was a 2001x2001 canvas with the 2.49:1 lockup using
        only 1572x631 of it — sizing by height would have scaled the empty
        padding rather than the mark. It is trimmed to its ink and resized to
        640px wide; `images.unoptimized` is true for the Cloudflare/OpenNext
        target, so whatever sits here is what every visitor downloads. The
        untouched original is in docs/brand/Full-original.png.
      */}
      <SidebarHeader>
        <Link
          href='/dashboard/overview'
          className='flex flex-col items-center rounded-md px-1 py-1'
        >
          {/* Expanded: the lockup. Collapsed: the BG monogram — a 2.49:1
              wordmark cannot be read in a 3.5rem rail. Both are transparent
              single-colour teal artwork, so the pale starburst is the same ink
              at low alpha and recedes on dark while the letters hold. */}
          <Image
            src='/assets/Full.png'
            alt='Dr Bhavin Garara'
            width={640}
            height={257}
            // ~56px tall / ~140px wide: roughly one nav row in height, so the
            // header reads as branding rather than dominating the rail. Full
            // sidebar width made it ~96px tall and top-heavy.
            className='h-14 w-auto object-contain group-data-[collapsible=icon]:hidden'
            priority
          />
          <Image
            src='/assets/monogram-new.png'
            alt='Dr Bhavin Garara'
            width={256}
            height={256}
            // 32px in the 40px rail button: this mark carries the BG letters
            // and a starburst, so it needs more room than the old flat emblem
            // to stay legible.
            className='hidden size-8 shrink-0 object-contain group-data-[collapsible=icon]:block'
            priority
          />
          <span className='sr-only'>Go to dashboard</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Main menu</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading
              ? // Every nav item is role-gated, so until the role resolves the
                // filter matches nothing. Hold the shape rather than flashing
                // an empty rail.
                //
                // Widths are a fixed sequence, not random: they render on the
                // server too, so anything non-deterministic here is a hydration
                // mismatch.
                SKELETON_WIDTHS.map((width, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon width={width} />
                  </SidebarMenuItem>
                ))
              : items.map((item) => {
                  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                  const isActive =
                    pathname === item.url || pathname.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        size='lg'
                        // Two things:
                        //  - Active item wears the brand accent. The cva default
                        //    is `bg-sidebar-accent` (a neutral wash); under an
                        //    accent-only palette the active row is one of the
                        //    few places teal earns its keep.
                        //  - Collapsed: a 40px square that exactly fills the
                        //    3.5rem rail's content box, so the glyph lands dead
                        //    centre. `size-10!` has to out-specify the cva
                        //    base's `size-8!`.
                        className='data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!'
                      >
                        <Link href={item.url}>
                          {/* No margin on the icon: the button's own `gap-2`
                              spaces it from the label, and that gap collapses
                              with the label. A fixed `mr-3` here is what pushed
                              the glyph off-centre in the collapsed rail. */}
                          <Icon className='size-5 shrink-0' />
                          <span className='truncate group-data-[collapsible=icon]:hidden'>
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  tooltip={user?.fullName ?? 'Account'}
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!'
                >
                  <UserAvatarProfile
                    className='size-7 shrink-0 rounded-md'
                    showInfo
                    user={user}
                  />
                  <IconSelector className='ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='min-w-56 rounded-lg'
                side='right'
                align='end'
                sideOffset={8}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5'>
                    <UserAvatarProfile
                      className='size-8 rounded-md'
                      showInfo
                      user={user}
                    />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* The account page holds the only change-password entry
                    point and was previously unreachable — no nav item, no
                    menu link. */}
                <DropdownMenuItem asChild>
                  <Link href='/dashboard/profile'>
                    <IconUserCircle className='mr-2 size-4' />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <>
                      <Loader2 className='mr-2 size-4 animate-spin' />
                      Signing out…
                    </>
                  ) : (
                    <>
                      <IconLogout className='mr-2 size-4' />
                      Sign out
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
