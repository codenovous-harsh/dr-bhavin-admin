import { Metadata } from 'next';
import ResetPasswordView from '@/features/auth/components/reset-password-view';

export const metadata: Metadata = {
  title: 'Authentication | Reset Password',
  description: 'Choose a new password.'
};

export default async function Page({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ResetPasswordView token={token} />;
}
