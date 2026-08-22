import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string;
    fullName?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initials =
    user?.fullName
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '—';

  return (
    <>
      <Avatar className={cn('rounded-md', className)}>
        <AvatarImage src={user?.imageUrl || ''} alt='' />
        <AvatarFallback className='rounded-md text-xs font-medium'>
          {initials}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        // Hidden in the collapsed rail so the avatar can centre on its own.
        // `min-w-0` lets the truncation actually engage inside a flex parent.
        <span className='grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden'>
          <span className='truncate text-sm font-medium'>
            {user?.fullName || 'Signed out'}
          </span>
          {email && (
            <span className='text-muted-foreground truncate text-xs'>
              {email}
            </span>
          )}
        </span>
      )}
    </>
  );
}
