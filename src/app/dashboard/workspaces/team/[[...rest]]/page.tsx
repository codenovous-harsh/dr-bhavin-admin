'use client';

import PageContainer from '@/components/layout/page-container';
import { teamInfoContent } from '@/config/infoconfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Settings, Shield, Users } from 'lucide-react';

// Dummy team members
const teamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Developer',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Designer',
    status: 'Active'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Developer',
    status: 'Invited'
  }
];

export default function TeamPage() {
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <div className='space-y-6'>
        {/* Team Overview */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Members
              </CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>4</div>
              <p className='text-muted-foreground text-xs'>
                3 active, 1 pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Admin Users</CardTitle>
              <Shield className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1</div>
              <p className='text-muted-foreground text-xs'>Full access</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Developers</CardTitle>
              <Settings className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>2</div>
              <p className='text-muted-foreground text-xs'>Code access</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Invites
              </CardTitle>
              <UserPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1</div>
              <p className='text-muted-foreground text-xs'>Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their roles
                </CardDescription>
              </div>
              <Button>
                <UserPlus className='mr-2 h-4 w-4' />
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div className='flex items-center gap-4'>
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{member.name}</p>
                      <p className='text-muted-foreground text-sm'>
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Badge variant='outline'>{member.role}</Badge>
                    <Badge
                      variant={
                        member.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {member.status}
                    </Badge>
                    <Button variant='outline' size='sm'>
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>
              Configure your organization preferences
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Organization Name</p>
                <p className='text-muted-foreground text-sm'>
                  Bhavin Garara Corp
                </p>
              </div>
              <Button variant='outline'>Edit</Button>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Organization ID</p>
                <p className='text-muted-foreground text-sm'>
                  org_dummy_123456
                </p>
              </div>
              <Button variant='outline' disabled>
                Copy
              </Button>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Two-Factor Authentication</p>
                <p className='text-muted-foreground text-sm'>
                  Enhance security with 2FA
                </p>
              </div>
              <Button variant='outline'>Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
