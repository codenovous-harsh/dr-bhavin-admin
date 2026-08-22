import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign In to the Dr Bhavin Garara clinic admin.'
};

// This used to fetch the GitHub star count of the upstream dashboard template
// on every render and thread it in as a `stars` prop the view never rendered —
// a dead outbound request from the login page.
export default function Page() {
  return <SignInViewPage />;
}
