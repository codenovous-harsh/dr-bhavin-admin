import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  // Route on session state instead of always landing on the dashboard.
  // middleware.ts guards /dashboard on this same cookie.
  const token = (await cookies()).get('token')?.value;

  redirect(token ? '/dashboard/overview' : '/auth/sign-in');
}
