'use client';

import { Check, ChevronsUpDown, GalleryVerticalEnd, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

// Dummy organizations data
const dummyOrganizations = [
  { id: '1', name: 'Bhavin Garara Corp', slug: 'bhavin-garara-corp' },
  { id: '2', name: 'Tech Solutions', slug: 'tech-solutions' },
  { id: '3', name: 'Digital Agency', slug: 'digital-agency' }
];

export function OrgSwitcher() {
  const { isMobile, state } = useSidebar();
  const router = useRouter();

  // Set the first organization as active by default
  const activeOrganization = dummyOrganizations[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeOrganization?.name || 'Select Organization'}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  Premium Admin Dashboard
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Organizations
            </DropdownMenuLabel>
            {dummyOrganizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  console.log(`Switching to ${org.name} (dummy action)`);
                }}
                className='gap-2 p-2'
              >
                <div className='bg-muted flex size-6 items-center justify-center rounded-sm border'>
                  <GalleryVerticalEnd className='size-4 shrink-0' />
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                {activeOrganization?.id === org.id && (
                  <Check className='ml-auto h-4 w-4' />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium'>Add Organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
