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
import SendEmailDialog from '@/features/skinAnalysis/components/send-email-dialog';
import { formatDuration } from '@/lib/format-date';
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
  const [emailOpen, setEmailOpen] = useState(false);

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
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
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
              <Icons.close className="h-12 w-12 text-destructive mx-auto mb-4" />
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
          <Button variant="outline" onClick={() => setEmailOpen(true)}>
            Email patient
          </Button>
          {getStatusBadge(analysis.status)}
        </div>
      </div>

      <SendEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        analysisId={analysis._id}
        patientName={`${analysis.firstName} ${analysis.lastName}`}
        patientEmail={analysis.email}
        emailHistory={(analysis as any).emailHistory || []}
        onSent={(history) =>
          setAnalysis((prev) => (prev ? ({ ...prev, emailHistory: history } as any) : prev))
        }
      />

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
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Research use
              </p>
              <p
                className={`text-sm font-medium ${
                  analysis.researchConsent
                    ? 'text-success'
                    : 'text-warning'
                }`}
              >
                {analysis.researchConsent ? 'Opted in' : 'Opted out'}
              </p>
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

          <ProcessingTime analysis={analysis} />

          {analysis.status === 'failed' && analysis.error && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive">{analysis.error}</p>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
              <Icons.dashboard className="h-12 w-12 text-warning mx-auto mb-4" />
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

/**
 * Where the time went on this analysis run.
 *
 * Shown for completed AND failed records — a job that fell over after nine
 * minutes is exactly the one worth opening. Renders nothing when the record has
 * no timings: everything submitted before the backend started recording them,
 * plus any run whose process died before it could write its own figures.
 *
 * `Total` is the job, not the patient's wait. The photo upload to R2 finishes
 * before the job is dispatched, so Submitted → Analyzed On always reads longer.
 */
function ProcessingTime({ analysis }: { analysis: SkinAnalysis }) {
  const t = analysis.timings;
  if (!t || t.totalMs == null) return null;

  // Anything the phase breakdown doesn't account for: parsing the model's
  // markdown, and the save. Normally negligible — if it isn't, that's the
  // finding.
  const measured = (t.photoLoadMs ?? 0) + (t.aiMs ?? 0);
  const otherMs = t.photoLoadMs != null && t.aiMs != null
    ? Math.max(0, t.totalMs - measured)
    : null;

  const phases: { label: string; value: string; hint?: string }[] = [
    {
      label: 'Photo load',
      value: formatDuration(t.photoLoadMs),
      hint: t.photoCount != null ? `${t.photoCount} photos from R2` : undefined
    },
    {
      label: 'AI analysis',
      value: formatDuration(t.aiMs),
      hint:
        t.firstTokenMs != null
          ? `${formatDuration(t.firstTokenMs)} to first token`
          : undefined
    }
  ];
  if (otherMs != null) {
    phases.push({ label: 'Parsing & save', value: formatDuration(otherMs) });
  }

  const tokenBits = [
    t.inputTokens != null ? `${t.inputTokens.toLocaleString()} in` : null,
    t.outputTokens != null ? `${t.outputTokens.toLocaleString()} out` : null,
    t.cacheReadTokens != null
      ? `${t.cacheReadTokens.toLocaleString()} cached`
      : null
  ].filter(Boolean);

  const provenance = [
    t.model || null,
    t.promptVersion ? `prompt v${t.promptVersion}` : null
  ].filter(Boolean);

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Processing time
        </p>
        <p className="text-lg font-semibold tabular-nums">
          {formatDuration(t.totalMs)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {phases.map((phase) => (
          <div key={phase.label}>
            <p className="text-xs text-muted-foreground">{phase.label}</p>
            <p className="text-sm tabular-nums">{phase.value}</p>
            {phase.hint && (
              <p className="text-xs text-muted-foreground">{phase.hint}</p>
            )}
          </div>
        ))}
      </div>

      {(tokenBits.length > 0 || provenance.length > 0) && (
        <p className="mt-3 text-xs text-muted-foreground">
          {[tokenBits.join(' · '), provenance.join(' · ')]
            .filter(Boolean)
            .join('  —  ')}
        </p>
      )}

      {analysis.status === 'failed' && (
        <p className="mt-2 text-xs text-muted-foreground">
          Time spent before this run failed.
        </p>
      )}
    </div>
  );
}
