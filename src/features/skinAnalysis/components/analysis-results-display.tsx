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

  // Shared prose styling for rendered markdown reports. Beyond the base
  // typography plugin, this pulls headings out with clear size/weight/colour,
  // adds a divider under the top-level section headings, and opens up spacing
  // between paragraphs and list items so long clinical reports are scannable.
  const reportProse =
    'prose prose-sm dark:prose-invert max-w-none ' +
    'prose-headings:font-semibold prose-headings:text-foreground ' +
    'prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-4 ' +
    'prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border ' +
    'prose-h3:text-base prose-h3:font-semibold prose-h3:text-primary dark:prose-h3:text-primary prose-h3:mt-6 prose-h3:mb-2 ' +
    'prose-p:my-3 prose-p:leading-relaxed ' +
    'prose-li:my-1 prose-ul:my-3 prose-ol:my-3 ' +
    'prose-strong:text-foreground prose-strong:font-semibold ' +
    'prose-hr:my-6';

  return (
    <div className="space-y-6">
      {/* Skin Type Card */}
      {analysis.skinType && (
        <Card>
          <CardHeader>
            <CardTitle>Determined Skin Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">
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
            <div className={reportProse}>
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
            <div className={reportProse}>
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
            <div className={reportProse}>
              <ReactMarkdown>{analysis.fullAnalysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
