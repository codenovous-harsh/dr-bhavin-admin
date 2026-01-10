'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInViewPage({ stars }: { stars: number }) {
  const router = useRouter();
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy sign in - just redirect to dashboard
    router.push('/dashboard/overview');
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col text-white lg:flex dark:border-r'>
        {/* Radial Gradient Background */}
        <div
          className='absolute inset-0'
          style={{
            background: `radial-gradient(circle at 30% 50%, #27A48C 0%, #0F3E35 70%)`
          }}
        />

        {/* Center Logo */}
        <div className='relative z-10 flex flex-1 items-center justify-center'>
          <div
            className='absolute h-96 w-96 rounded-full opacity-20 blur-3xl'
            style={{
              background: `radial-gradient(circle, #27A48C 0%, transparent 70%)`
            }}
          />
          <div className='relative z-20 rounded-3xl bg-white p-12 shadow-2xl'>
            <Image
              src='/assets/bhavinLogo.svg'
              alt='Bhavin Garara'
              width={400}
              height={120}
              className='h-24 w-auto'
            />
          </div>
        </div>
      </div>

      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <Card className='w-full'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-center text-2xl'>Sign in</CardTitle>
              <CardDescription className='text-center'>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='focus:border-[#27A48C] focus:ring-[#27A48C]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='focus:border-[#27A48C] focus:ring-[#27A48C]'
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  style={{
                    background: `linear-gradient(135deg, #27A48C 0%, #0F3E35 100%)`
                  }}
                >
                  Sign In
                </Button>
              </CardContent>
            </form>
          </Card>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-[#27A48C]'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-[#27A48C]'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
