'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavItems } from '@/hooks/use-nav';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);
  const [user, setUser] = React.useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Load user from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Format user data to match expected structure
        setUser({
          id: userData.id || userData._id,
          fullName: userData.name || userData.fullName || 'User',
          firstName: userData.name?.split(' ')[0] || userData.firstName || 'User',
          lastName: userData.name?.split(' ')[1] || userData.lastName || '',
          emailAddresses: [{ emailAddress: userData.email }],
          imageUrl: userData.avatar || userData.imageUrl || null
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/auth/sign-in');
      router.refresh();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error?.message || 'Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='flex items-center justify-center p-4'>
          <Image
            src='/assets/dashboardLogo.svg'
            alt='Bhavin Garara'
            width={180}
            height={60}
            className='h-12 w-auto object-contain'
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-muted-foreground mb-2 px-2 text-xs font-semibold'>
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                        size='lg'
                        className='h-12 text-sm font-medium'
                      >
                        {item.icon && <Icon className='h-5 w-5' />}
                        <span className='text-sm'>{item.title}</span>
                        <IconChevronRight className='ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                              className='h-10 text-sm'
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    size='lg'
                    className='h-12 text-sm font-medium'
                  >
                    <Link href={item.url} className='flex items-center'>
                      <Icon className='mr-3 h-5 w-5' />
                      <span className='text-sm'>{item.title}</span>
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
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <IconLogout className='mr-2 h-4 w-4' />
                      Sign Out
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
