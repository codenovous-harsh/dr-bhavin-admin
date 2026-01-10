'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useState } from 'react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='space-y-0.5'>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>
          Manage your clinic settings and preferences
        </p>
      </div>
      <Separator />

      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='clinic'>Clinic Info</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='billing'>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='timezone'>Timezone</Label>
                <Select defaultValue='est'>
                  <SelectTrigger id='timezone'>
                    <SelectValue placeholder='Select timezone' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pst'>Pacific Time (PST)</SelectItem>
                    <SelectItem value='mst'>Mountain Time (MST)</SelectItem>
                    <SelectItem value='cst'>Central Time (CST)</SelectItem>
                    <SelectItem value='est'>Eastern Time (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='language'>Language</Label>
                <Select defaultValue='en'>
                  <SelectTrigger id='language'>
                    <SelectValue placeholder='Select language' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='es'>Spanish</SelectItem>
                    <SelectItem value='fr'>French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date-format'>Date Format</Label>
                <Select defaultValue='mm-dd-yyyy'>
                  <SelectTrigger id='date-format'>
                    <SelectValue placeholder='Select date format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mm-dd-yyyy'>MM/DD/YYYY</SelectItem>
                    <SelectItem value='dd-mm-yyyy'>DD/MM/YYYY</SelectItem>
                    <SelectItem value='yyyy-mm-dd'>YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='working-hours'>Working Hours</Label>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='start-time' className='text-sm'>
                      Start Time
                    </Label>
                    <Input type='time' id='start-time' defaultValue='09:00' />
                  </div>
                  <div>
                    <Label htmlFor='end-time' className='text-sm'>
                      End Time
                    </Label>
                    <Input type='time' id='end-time' defaultValue='18:00' />
                  </div>
                </div>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='email-notifications'>
                    Email Notifications
                  </Label>
                  <p className='text-muted-foreground text-sm'>
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id='email-notifications'
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='sms-notifications'>SMS Notifications</Label>
                  <p className='text-muted-foreground text-sm'>
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id='sms-notifications'
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='appointment-reminders'>
                    Appointment Reminders
                  </Label>
                  <p className='text-muted-foreground text-sm'>
                    Send automatic appointment reminders to patients
                  </p>
                </div>
                <Switch
                  id='appointment-reminders'
                  checked={appointmentReminders}
                  onCheckedChange={setAppointmentReminders}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='marketing-emails'>Marketing Emails</Label>
                  <p className='text-muted-foreground text-sm'>
                    Receive promotional and marketing emails
                  </p>
                </div>
                <Switch
                  id='marketing-emails'
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='clinic' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                Update your clinic details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='clinic-name'>Clinic Name</Label>
                <Input
                  id='clinic-name'
                  defaultValue='Bhavin Garara Dental Clinic'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clinic-email'>Email Address</Label>
                <Input
                  id='clinic-email'
                  type='email'
                  defaultValue='contact@bhavingarara.com'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clinic-phone'>Phone Number</Label>
                <Input id='clinic-phone' defaultValue='+1 (234) 567-8900' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clinic-address'>Address</Label>
                <Textarea
                  id='clinic-address'
                  defaultValue='123 Main Street, Suite 100&#10;City, State 12345'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clinic-website'>Website</Label>
                <Input
                  id='clinic-website'
                  defaultValue='https://bhavingarara.com'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clinic-description'>Clinic Description</Label>
                <Textarea
                  id='clinic-description'
                  defaultValue='Premium dental care clinic offering comprehensive oral health services with state-of-the-art equipment and experienced professionals.'
                  rows={4}
                />
              </div>

              <Button>Update Information</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='current-password'>Current Password</Label>
                <Input id='current-password' type='password' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='new-password'>New Password</Label>
                <Input id='new-password' type='password' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm New Password</Label>
                <Input id='confirm-password' type='password' />
              </div>

              <Button>Change Password</Button>

              <Separator />

              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>
                  Two-Factor Authentication
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Add an extra layer of security to your account
                </p>
                <Button variant='outline'>Enable 2FA</Button>
              </div>

              <Separator />

              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Session Management</h3>
                <p className='text-muted-foreground text-sm'>
                  Manage your active sessions across devices
                </p>
                <Button variant='outline'>View Active Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='billing' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium'>Current Plan</p>
                    <p className='text-2xl font-bold'>Professional</p>
                  </div>
                  <Badge variant='default'>Active</Badge>
                </div>
                <p className='text-muted-foreground mt-2 text-sm'>
                  $99/month • Renews on February 1, 2024
                </p>
              </div>

              <div className='space-y-2'>
                <Label>Features Included</Label>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center'>
                    <Icons.check className='mr-2 h-4 w-4 text-green-600' />
                    Unlimited patient records
                  </li>
                  <li className='flex items-center'>
                    <Icons.check className='mr-2 h-4 w-4 text-green-600' />
                    Advanced appointment scheduling
                  </li>
                  <li className='flex items-center'>
                    <Icons.check className='mr-2 h-4 w-4 text-green-600' />
                    Custom treatment plans
                  </li>
                  <li className='flex items-center'>
                    <Icons.check className='mr-2 h-4 w-4 text-green-600' />
                    Blog management system
                  </li>
                  <li className='flex items-center'>
                    <Icons.check className='mr-2 h-4 w-4 text-green-600' />
                    24/7 customer support
                  </li>
                </ul>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline'>Change Plan</Button>
                <Button variant='outline'>Update Payment Method</Button>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Billing History</Label>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <p className='text-sm font-medium'>January 2024</p>
                      <p className='text-muted-foreground text-xs'>
                        Professional Plan
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>$99.00</p>
                      <p className='text-xs text-green-600'>Paid</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <p className='text-sm font-medium'>December 2023</p>
                      <p className='text-muted-foreground text-xs'>
                        Professional Plan
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>$99.00</p>
                      <p className='text-xs text-green-600'>Paid</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
