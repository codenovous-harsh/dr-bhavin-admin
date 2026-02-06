'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import skinAnalysisService from '@/services/skinAnalysis.service';
import PatientStatsCards from '@/features/skinAnalysis/components/patient-stats-cards';
import PatientsTable from '@/features/skinAnalysis/components/patients-table';
import type { SkinAnalysis } from '@/types/skinAnalysis';

export default function PatientsPage() {
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);

    try {
      const options: any = {
        page: currentPage,
        limit: 10,
        sortBy: '-createdAt',
      };

      if (searchTerm) {
        options.search = searchTerm;
      }

      if (statusFilter && statusFilter !== 'all') {
        options.status = statusFilter;
      }

      const response = await skinAnalysisService.getAllAnalyses(options);
      setAnalyses(response.data.analyses);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalAnalyses);
    } catch (err: any) {
      // Check if it's an authorization error
      if (err.response?.status === 403) {
        setError('You do not have permission to access this page. Please contact an administrator.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load patient data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [currentPage, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchAnalyses();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Skin Analysis Patients
        </h2>
      </div>

      {/* Stats Cards */}
      <PatientStatsCards />

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Submissions</CardTitle>
          <CardDescription>
            View and manage all skin analysis submissions
          </CardDescription>
          <div className="flex flex-col gap-4 py-4 sm:flex-row">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalyses}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <PatientsTable analyses={analyses} loading={loading} />

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {analyses.length} of {totalCount} submissions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
