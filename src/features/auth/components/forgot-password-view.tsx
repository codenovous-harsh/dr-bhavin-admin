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
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSent(true);
      toast.success(res.message || 'Check your email for a reset link');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
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
              <CardTitle className='text-center text-2xl'>
                {sent ? 'Check your email' : 'Forgot password'}
              </CardTitle>
              <CardDescription className='text-center'>
                {sent
                  ? "If an account exists for that email, we've sent a password reset link."
                  : 'Enter your email and we will send you a reset link.'}
              </CardDescription>
            </CardHeader>
            {sent ? (
              <CardContent className='space-y-4'>
                <div className='flex flex-col items-center space-y-3 py-4'>
                  <CheckCircle2 className='h-12 w-12 text-[#27A48C]' />
                  <p className='text-muted-foreground text-center text-sm'>
                    The link expires in 30 minutes. Didn't get it? Check your
                    spam folder or try again.
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Send to a different email
                </Button>
                <Link
                  href='/auth/sign-in'
                  className='block text-center text-sm font-medium text-[#27A48C] hover:underline'
                >
                  Back to sign in
                </Link>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='focus:border-[#27A48C] focus:ring-[#27A48C]'
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isLoading}
                    style={{
                      background: `linear-gradient(135deg, #27A48C 0%, #0F3E35 100%)`
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                  <Link
                    href='/auth/sign-in'
                    className='block text-center text-sm font-medium text-[#27A48C] hover:underline'
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
