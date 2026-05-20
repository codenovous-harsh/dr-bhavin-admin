'use client';

import { useState } from 'react';
import type { SimulationColumnResult } from '@/types/prompt';

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={i} className="mt-3 text-base font-semibold">
          {trimmed.slice(3)}
        </h3>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <li key={i} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    const content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
        {result?.latencyMs && (
          <span className="rounded bg-muted px-2 py-1 text-xs text-foreground/80">
            {(result.latencyMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {loading && <div className="py-8 text-center text-muted-foreground">Running…</div>}

      {!loading && result?.error && (
        <div className="rounded bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-800 dark:text-red-200">
          <p className="mb-2">{result.error}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-red-700 dark:text-red-300 underline">
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && result?.response && (
        <>
          {result.warnings.length > 0 && (
            <div className="mb-3 rounded bg-amber-50 dark:bg-amber-950/50 p-2 text-xs text-amber-800 dark:text-amber-200">
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
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
