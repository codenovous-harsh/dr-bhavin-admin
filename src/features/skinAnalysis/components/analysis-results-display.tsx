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

  return (
    <div className="space-y-6">
      {/* Skin Type Card */}
      {analysis.skinType && (
        <Card>
          <CardHeader>
            <CardTitle>Determined Skin Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
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

      {/* Full Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{analysis.fullAnalysis}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
