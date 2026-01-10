'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';

export default function ExclusivePage() {
  // Dummy organization data
  const organization = {
    name: 'Bhavin Garara Corp'
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <BadgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area
          </h1>
          <p className='text-muted-foreground'>
            Welcome, <span className='font-semibold'>{organization?.name}</span>
            ! This page contains exclusive features for Pro plan organizations.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Premium Features Available</CardTitle>
            <CardDescription>
              You have full access to all premium features in this demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-lg'>
              This is a dummy exclusive area with premium content.
            </div>
            <div className='text-muted-foreground mt-4 space-y-2 text-sm'>
              <p>• Advanced Analytics Dashboard</p>
              <p>• Priority Support Access</p>
              <p>• Custom Integrations</p>
              <p>• Unlimited API Calls</p>
              <p>• White-label Options</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
