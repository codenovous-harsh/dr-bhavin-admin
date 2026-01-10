import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Bypass authentication - redirect directly to overview
  redirect('/dashboard/overview');
}
