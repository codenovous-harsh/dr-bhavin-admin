'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ChangePasswordDialog } from './change-password-dialog';

/**
 * Account page.
 *
 * This previously rendered a hardcoded "John Doe / john.doe@example.com /
 * San Francisco, CA" template profile. It now shows the signed-in user.
 *
 * It is kept (rather than deleted with the rest of the template pages) because
 * it holds ChangePasswordDialog — the only route to changing your password.
 */
export default function ProfileViewPage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <PageContainer
      pageTitle='Account'
      pageDescription='Your profile and sign-in details.'
    >
      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Details come from your account record. Contact a superadmin to
              change your name or role.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {isLoading ? (
              <div className='flex items-center gap-4'>
                <Skeleton className='size-14 rounded-md' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-3 w-56' />
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-4'>
                <UserAvatarProfile
                  className='size-14 text-base'
                  showInfo
                  user={user}
                />
              </div>
            )}

            <Separator />

            <dl className='grid gap-4 sm:grid-cols-2'>
              <Field label='Full name' value={user?.fullName} loading={isLoading} />
              <Field
                label='Email'
                value={user?.emailAddresses?.[0]?.emailAddress}
                loading={isLoading}
              />
              <div className='space-y-1'>
                <dt className='text-muted-foreground text-sm'>Role</dt>
                <dd>
                  {isLoading ? (
                    <Skeleton className='h-5 w-24' />
                  ) : user?.role ? (
                    <Badge variant='secondary' className='capitalize'>
                      {user.role}
                    </Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>—</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change the password you use to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordDialog />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  value,
  loading
}: {
  label: string;
  value?: string;
  loading: boolean;
}) {
  return (
    <div className='space-y-1'>
      <dt className='text-muted-foreground text-sm'>{label}</dt>
      <dd className='text-sm font-medium'>
        {loading ? (
          <Skeleton className='h-4 w-40' />
        ) : (
          value || <span className='text-muted-foreground'>—</span>
        )}
      </dd>
    </div>
  );
}
