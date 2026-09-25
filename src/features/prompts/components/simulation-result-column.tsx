'use client';

import { useState } from 'react';
import type { SimulationColumnResult } from '@/types/prompt';

// Model output goes into innerHTML for the bold markup, so escape it first.
function inline(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    // v3.x reports head their sections with ###, older ones with ##.
    const heading = trimmed.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      return (
        <h3 key={i} className="mt-3 text-base font-semibold">
          {heading[1]}
        </h3>
      );
    }
    if (trimmed === '---') return <hr key={i} className="my-4 border-border" />;
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = inline(trimmed.slice(2));
      return <li key={i} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    const content = inline(trimmed);
    return <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: content }} />;
  });
}

interface Props {
  title: string;
  loading: boolean;
  result: SimulationColumnResult | null;
  onRetry?: () => void;
}

export function SimulationResultColumn({ title, loading, result, onRetry }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="flex flex-col rounded border border-border bg-card text-card-foreground p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {!loading && result?.latencyMs ? (
          <span className="rounded bg-muted px-2 py-1 text-xs text-foreground/80">
            {(result.latencyMs / 1000).toFixed(0)}s
            {result.inputTokens != null && result.outputTokens != null && (
              <>
                {' · '}
                {Math.round(result.inputTokens / 1000)}k in / {Math.round(result.outputTokens / 1000)}k out
              </>
            )}
          </span>
        ) : null}
      </div>

      {loading && <div className="py-8 text-center text-muted-foreground">Running…</div>}

      {!loading && result?.error && (
        <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
          <p className="mb-2">{result.error}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-destructive underline">
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && result?.response && (
        <>
          {result.warnings.length > 0 && (
            <div className="mb-3 rounded bg-warning/10 p-2 text-xs text-foreground">
              {result.warnings.map((w, i) => (
                <div key={i}>⚠ {w}</div>
              ))}
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto">
            {renderMarkdown(result.response)}
          </div>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="mt-3 text-xs text-primary hover:underline"
          >
            {showPrompt ? 'Hide' : 'Show'} rendered prompt
          </button>
          {showPrompt && (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted text-foreground p-2 text-xs whitespace-pre-wrap">
              {result.userPromptRendered}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
