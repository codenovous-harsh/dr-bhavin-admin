'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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

  // Show nothing if user is not loaded yet or not authenticated
  if (!user) {
    return null;
  }

  // Format user data to match expected structure
  const formattedUser = {
    id: user.id || user._id,
    fullName: user.name || user.fullName || 'User',
    firstName: user.name?.split(' ')[0] || user.firstName || 'User',
    lastName: user.name?.split(' ')[1] || user.lastName || '',
    emailAddresses: [{ emailAddress: user.email }],
    imageUrl: user.avatar || user.imageUrl || null
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <UserAvatarProfile user={formattedUser} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {formattedUser.fullName}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {formattedUser.emailAddresses[0].emailAddress}
            </p>
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
            'Sign Out'
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
