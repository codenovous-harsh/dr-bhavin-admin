import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Mail, User, Shield, Key } from 'lucide-react';

export default function ProfileViewPage() {
  // Dummy user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    joinedDate: 'January 2024',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA'
  };

  return (
    <div className='flex w-full flex-col space-y-6 p-4'>
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <Avatar className='h-20 w-20'>
                <AvatarFallback className='text-2xl'>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size='icon'
                variant='secondary'
                className='absolute right-0 bottom-0 h-8 w-8 rounded-full'
              >
                <Camera className='h-4 w-4' />
              </Button>
            </div>
            <div>
              <CardTitle className='text-2xl'>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input id='firstName' defaultValue='John' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input id='lastName' defaultValue='Doe' />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' defaultValue={user.email} />
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input id='phone' defaultValue={user.phone} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='location'>Location</Label>
              <Input id='location' defaultValue={user.location} />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account security and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <Shield className='text-muted-foreground h-5 w-5' />
              <div>
                <p className='font-medium'>Two-Factor Authentication</p>
                <p className='text-muted-foreground text-sm'>
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Button variant='outline'>Enable</Button>
          </div>
          <Separator />
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <Key className='text-muted-foreground h-5 w-5' />
              <div>
                <p className='font-medium'>Change Password</p>
                <p className='text-muted-foreground text-sm'>
                  Update your password regularly for better security
                </p>
              </div>
            </div>
            <Button variant='outline'>Update</Button>
          </div>
          <Separator />
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <Mail className='text-muted-foreground h-5 w-5' />
              <div>
                <p className='font-medium'>Email Notifications</p>
                <p className='text-muted-foreground text-sm'>
                  Manage your email preferences
                </p>
              </div>
            </div>
            <Button variant='outline'>Configure</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Role</span>
            <span className='font-medium'>{user.role}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Member Since</span>
            <span className='font-medium'>{user.joinedDate}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Account ID</span>
            <span className='font-medium'>user_dummy_123456</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
