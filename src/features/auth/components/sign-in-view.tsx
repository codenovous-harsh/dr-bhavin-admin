'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SignInViewPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Call actual backend API
      const response = await authService.login({ email, password });

      // Success!
      toast.success('Login successful!');

      // Redirect to dashboard
      router.push('/dashboard/overview');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);

      // Show error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <div className='relative z-20 flex flex-col items-center gap-4 text-center'>
            {/* The cream lockup already carries the practice name, so a
                separate heading would repeat it — only the context line
                survives. It ships pre-coloured for a dark ground (#F5EBE0), so
                unlike the monogram it needs no brightness-0/invert filter. */}
            <Image
              src='/assets/logo-cream.png'
              alt='Dr Bhavin Garara'
              width={640}
              height={257}
              className='w-72 max-w-full object-contain drop-shadow-lg'
              priority
            />
            <p className='text-sm text-white/70'>Clinic administration</p>
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
                   
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='password'>Password</Label>
                    <Link
                      href='/auth/forgot-password'
                      className='text-sm font-medium text-primary hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                   
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
