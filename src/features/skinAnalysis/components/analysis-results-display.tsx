'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import type { SkinAnalysisResult } from '@/types/skinAnalysis';

interface AnalysisResultsDisplayProps {
  analysis: SkinAnalysisResult;
}

export default function AnalysisResultsDisplay({
  analysis,
}: AnalysisResultsDisplayProps) {
  if (!analysis || !analysis.fullAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analysis not available or still processing
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasTier1 = typeof analysis.tier1 === 'string' && analysis.tier1.trim().length > 0;
  const hasTier2 = typeof analysis.tier2 === 'string' && analysis.tier2.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Skin Type Card */}
      {analysis.skinType && (
        <Card>
          <CardHeader>
            <CardTitle>Determined Skin Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {analysis.skinType}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Concerns */}
      {analysis.primaryConcerns && analysis.primaryConcerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Concerns Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.primaryConcerns.map((concern, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {concern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* v3.7 Tier 1 — Patient-facing summary */}
      {hasTier1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tier 1 — Patient Summary</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              What the patient receives. Plain English, ≤1,000 words.
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis.tier1!}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* v3.7 Tier 2 — Clinical report */}
      {hasTier2 && (
        <Card>
          <CardHeader>
            <CardTitle>Tier 2 — Clinical Report</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              For Dr Garara&apos;s clinical file. Full terminology, confidence tags, safety flags.
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis.tier2!}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Analysis (raw) — legacy fallback when no Tier 1/Tier 2 split is present */}
      {!hasTier1 && !hasTier2 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis &amp; Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis.fullAnalysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
