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

interface Props {
  token: string;
}

export default function ResetPasswordView({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully. Please sign in.');
      setTimeout(() => router.push('/auth/sign-in'), 1500);
    } catch (error: any) {
      const msg = error.message || 'Failed to reset password';
      toast.error(msg);
      if (/invalid|expired/i.test(msg)) {
        setTokenInvalid(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col text-white lg:flex dark:border-r'>
        <div
          className='absolute inset-0'
          style={{
            background: `radial-gradient(circle at 30% 50%, #27A48C 0%, #0F3E35 70%)`
          }}
        />
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
              <CardTitle className='text-center text-2xl'>
                {tokenInvalid ? 'Link expired' : 'Reset password'}
              </CardTitle>
              <CardDescription className='text-center'>
                {tokenInvalid
                  ? 'This reset link is invalid or has expired.'
                  : 'Choose a new password for your account.'}
              </CardDescription>
            </CardHeader>
            {tokenInvalid ? (
              <CardContent className='space-y-4'>
                <Link
                  href='/auth/forgot-password'
                  className='block'
                >
                  <Button
                    type='button'
                    className='w-full'
                  >
                    Request a new link
                  </Button>
                </Link>
                <Link
                  href='/auth/sign-in'
                  className='block text-center text-sm font-medium text-primary hover:underline'
                >
                  Back to sign in
                </Link>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>New password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Min 8 characters'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                     
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm password</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      placeholder='Re-enter password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                     
                      disabled={isLoading}
                      required
                      minLength={8}
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
                        Resetting...
                      </>
                    ) : (
                      'Reset password'
                    )}
                  </Button>
                  <Link
                    href='/auth/sign-in'
                    className='block text-center text-sm font-medium text-primary hover:underline'
                  >
                    Back to sign in
                  </Link>
                </CardContent>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
