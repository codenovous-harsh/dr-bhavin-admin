import { Metadata } from 'next';
import ForgotPasswordView from '@/features/auth/components/forgot-password-view';

export const metadata: Metadata = {
  title: 'Authentication | Forgot Password',
  description: 'Request a password reset link.'
};

export default function Page() {
  return <ForgotPasswordView />;
}
