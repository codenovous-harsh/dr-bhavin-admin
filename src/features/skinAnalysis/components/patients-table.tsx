'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SkinAnalysis } from '@/types/skinAnalysis';
import { Icons } from '@/components/icons';

interface PatientsTableProps {
  analyses: SkinAnalysis[];
  loading?: boolean;
}

export default function PatientsTable({
  analyses,
  loading = false,
}: PatientsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'outline', label: 'Processing' },
      failed: { variant: 'destructive', label: 'Failed' },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant as any}>{config.label}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <Icons.users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">No patients found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          No skin analysis submissions match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.map((analysis) => (
            <TableRow key={analysis._id}>
              <TableCell className="font-medium">
                {analysis.firstName} {analysis.lastName}
              </TableCell>
              <TableCell>{analysis.email}</TableCell>
              <TableCell>{analysis.age}</TableCell>
              <TableCell className="capitalize">
                {analysis.gender.replace('_', ' ')}
              </TableCell>
              <TableCell>{getStatusBadge(analysis.status)}</TableCell>
              <TableCell>{formatDate(analysis.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/patients/${analysis._id}`)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
