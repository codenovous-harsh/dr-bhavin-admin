'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import skinAnalysisService from '@/services/skinAnalysis.service';
import QuestionnaireDisplay from '@/features/skinAnalysis/components/questionnaire-display';
import PhotoGallery from '@/features/skinAnalysis/components/photo-gallery';
import AnalysisResultsDisplay from '@/features/skinAnalysis/components/analysis-results-display';
import type { SkinAnalysis } from '@/types/skinAnalysis';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await skinAnalysisService.getAnalysisById(id);
        setAnalysis(data);
      } catch (err: any) {
        // Check if it's an authorization error
        if (err.response?.status === 403) {
          setError('You do not have permission to view this patient. Please contact an administrator.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load patient details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'outline', label: 'Processing' },
      failed: { variant: 'destructive', label: 'Failed' },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <Icons.chevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.close className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Patient</h3>
              <p className="text-sm text-muted-foreground">
                {error || 'Patient not found'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/dashboard/patients')}
              >
                Return to Patients List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <Icons.chevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {analysis.firstName} {analysis.lastName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analysis ID: {analysis._id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(analysis.status)}
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{analysis.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{analysis.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p className="text-sm">{analysis.age} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="text-sm capitalize">
                {analysis.gender.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ethnicity
              </p>
              <p className="text-sm capitalize">
                {analysis.ethnicity.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Submitted
              </p>
              <p className="text-sm">{formatDate(analysis.createdAt)}</p>
            </div>
          </div>

          {analysis.status === 'completed' && analysis.processedAt && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                Analyzed On
              </p>
              <p className="text-sm">{formatDate(analysis.processedAt)}</p>
            </div>
          )}

          {analysis.status === 'failed' && analysis.error && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-red-600">Error</p>
              <p className="text-sm text-red-600">{analysis.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Photos */}
      <PhotoGallery photos={analysis.photos} />

      {/* Questionnaire Responses */}
      <QuestionnaireDisplay questionnaire={analysis.questionnaire} />

      {/* AI Analysis Results */}
      {analysis.status === 'completed' && analysis.analysis && (
        <AnalysisResultsDisplay analysis={analysis.analysis} />
      )}

      {/* Processing Status */}
      {analysis.status === 'processing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Analysis in Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                The AI is currently analyzing this patient's photos and
                questionnaire responses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Status */}
      {analysis.status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.dashboard className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pending Analysis</h3>
              <p className="text-sm text-muted-foreground">
                This analysis is queued and will be processed shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
