'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  // Dummy organization data
  const organization = {
    name: 'Bhavin Garara Corp',
    plan: 'Pro'
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Billing & Plans</h1>
          <p className='text-muted-foreground'>
            Manage your subscription and billing information
          </p>
        </div>

        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            This is a demo billing page. No real payment processing is
            available.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {organization.name} - {organization.plan} Plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-semibold'>Pro Plan</span>
                <span className='text-2xl font-bold'>$29/month</span>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Check className='h-4 w-4 text-green-600' />
                  <span>Unlimited users</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Check className='h-4 w-4 text-green-600' />
                  <span>Advanced analytics</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Check className='h-4 w-4 text-green-600' />
                  <span>Priority support</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Check className='h-4 w-4 text-green-600' />
                  <span>Custom integrations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>For small teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$9/month</div>
              <Button className='mt-4 w-full' variant='outline' disabled>
                Downgrade
              </Button>
            </CardContent>
          </Card>
          <Card className='border-primary'>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$29/month</div>
              <Button className='mt-4 w-full' disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Custom</div>
              <Button className='mt-4 w-full' variant='outline'>
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
