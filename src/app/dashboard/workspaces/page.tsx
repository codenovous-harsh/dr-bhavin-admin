'use client';

import PageContainer from '@/components/layout/page-container';
import { workspacesInfoContent } from '@/config/infoconfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Settings, Plus, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Dummy workspaces data
const dummyWorkspaces = [
  {
    id: '1',
    name: 'Bhavin Garara Corp',
    slug: 'bhavin-garara-corp',
    members: 4,
    plan: 'Pro',
    isActive: true,
    createdAt: 'January 2024'
  },
  {
    id: '2',
    name: 'Tech Solutions',
    slug: 'tech-solutions',
    members: 12,
    plan: 'Enterprise',
    isActive: false,
    createdAt: 'March 2024'
  },
  {
    id: '3',
    name: 'Digital Agency',
    slug: 'digital-agency',
    members: 8,
    plan: 'Pro',
    isActive: false,
    createdAt: 'June 2024'
  }
];

export default function WorkspacesPage() {
  const [activeWorkspace, setActiveWorkspace] = useState(dummyWorkspaces[0].id);

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <div className='space-y-6'>
        {/* Create New Workspace Button */}
        <div className='flex justify-end'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Workspace
          </Button>
        </div>

        {/* Workspaces Grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {dummyWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                workspace.id === activeWorkspace ? 'ring-primary ring-2' : ''
              }`}
              onClick={() => setActiveWorkspace(workspace.id)}
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <Building2 className='text-primary h-8 w-8' />
                  {workspace.id === activeWorkspace && (
                    <Badge
                      variant='default'
                      className='flex items-center gap-1'
                    >
                      <CheckCircle className='h-3 w-3' />
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className='mt-4'>{workspace.name}</CardTitle>
                <CardDescription>{workspace.slug}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <Users className='text-muted-foreground h-4 w-4' />
                    <span>{workspace.members} members</span>
                  </div>
                  <Badge variant='outline'>{workspace.plan}</Badge>
                </div>
                <div className='text-muted-foreground text-xs'>
                  Created {workspace.createdAt}
                </div>
                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to team management
                    }}
                  >
                    <Users className='mr-2 h-3 w-3' />
                    Team
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to workspace settings
                    }}
                  >
                    <Settings className='mr-2 h-3 w-3' />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workspace Stats */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{dummyWorkspaces.length}</div>
              <p className='text-muted-foreground text-xs'>Across all plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dummyWorkspaces.reduce((sum, ws) => sum + ws.members, 0)}
              </div>
              <p className='text-muted-foreground text-xs'>
                Across all workspaces
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>2 Pro, 1 Enterprise</div>
              <p className='text-muted-foreground text-xs'>
                Premium subscriptions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
