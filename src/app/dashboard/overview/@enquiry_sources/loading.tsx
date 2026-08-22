import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-56' />
        <Skeleton className='mt-2 h-4 w-64' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[200px] w-full' />
      </CardContent>
    </Card>
  );
}
