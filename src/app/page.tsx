import { redirect } from 'next/navigation';

export default async function Page() {
  // Bypass authentication - redirect directly to dashboard
  redirect('/dashboard/overview');
}
