'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import promptService from '@/services/prompt.service';
import type { PromptTemplate } from '@/types/prompt';
import { PromptSimulator } from './prompt-simulator';

const VARIABLE_HINTS = [
  '{{age}}',
  '{{gender}}',
  '{{ethnicity}}',
  '{{questionnaire.skinMoisture}}',
  '{{questionnaire.skinSebum}}',
  '{{questionnaire.skinInflammation}}',
  '{{questionnaire.pigmentation}}',
  '{{questionnaire.skinElasticity}}',
  '{{questionnaire.skinConcerns}}',
  '{{questionnaire.lifestyleHabits}}',
  '{{questionnaire.suncareHabits}}',
  '{{questionnaire.eyeConcerns}}',
  '{{questionnaire.otherConcerns}}',
  '{{questionnaire.otherConcernsText}}',
  '{{questionnaire.addressConcerns}}',
];

const statusBadge: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export function PromptEditor({ id }: { id: string }) {
  const [doc, setDoc] = useState<PromptTemplate | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPromptTemplate, setUserPromptTemplate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await promptService.getById(id);
        setDoc(d);
        setSystemPrompt(d.systemPrompt);
        setUserPromptTemplate(d.userPromptTemplate);
        setNotes(d.notes);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || 'Failed to load prompt');
      }
    })();
  }, [id]);

  const isDraft = doc?.status === 'draft';

  async function handleSave() {
    if (!doc) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const updated = await promptService.update(doc._id, { systemPrompt, userPromptTemplate, notes });
      setDoc(updated);
      setInfo('Saved');
      setTimeout(() => setInfo(null), 2000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!doc) return;
    if (!confirm('Publish this draft? The currently published version will be archived.')) return;
    setSaving(true);
    setError(null);
    try {
      await promptService.update(doc._id, { systemPrompt, userPromptTemplate, notes });
      const result = await promptService.publish(doc._id);
      setDoc(result.published);
      setInfo(`Published as v${result.published.version}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Publish failed');
    } finally {
      setSaving(false);
    }
  }

  function insertVariable(variable: string) {
    const ta = document.getElementById('user-prompt-template') as HTMLTextAreaElement | null;
    if (!ta) {
      setUserPromptTemplate((prev) => prev + variable);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = userPromptTemplate.slice(0, start) + variable + userPromptTemplate.slice(end);
    setUserPromptTemplate(next);
  }

  if (!doc && !error) return <div className="p-4">Loading…</div>;
  if (!doc) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/prompts" className="text-sm text-blue-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">
            {doc.name} v{doc.version}
          </h1>
          <span className={`rounded px-2 py-1 text-xs ${statusBadge[doc.status]}`}>{doc.status}</span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={!isDraft || saving}
            onClick={handleSave}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            disabled={!isDraft || saving}
            onClick={handlePublish}
            className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Publish
          </button>
          <button
            onClick={() => setShowSimulator(true)}
            className="bg-primary text-primary-foreground rounded px-3 py-2 text-sm font-medium"
          >
            Run Simulation
          </button>
        </div>
      </div>

      {error && <div className="mb-3 rounded bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-800 dark:text-red-200">{error}</div>}
      {info && <div className="mb-3 rounded bg-green-50 dark:bg-green-950/50 p-3 text-sm text-green-800 dark:text-green-200">{info}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isDraft}
              className="w-full rounded border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground"
              placeholder="What changed in this version?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={!isDraft}
              rows={10}
              className="w-full rounded border border-input bg-background text-foreground px-3 py-2 font-mono text-xs placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">User Prompt Template</label>
            <textarea
              id="user-prompt-template"
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              disabled={!isDraft}
              rows={25}
              className="w-full rounded border border-input bg-background text-foreground px-3 py-2 font-mono text-xs placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground"
            />
          </div>
        </div>

        <aside className="rounded border border-border bg-card text-card-foreground p-3 text-sm">
          <h3 className="mb-2 font-medium">Available variables</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Click to insert into the user template at cursor.
          </p>
          <div className="flex flex-wrap gap-1">
            {VARIABLE_HINTS.map((v) => (
              <button
                key={v}
                onClick={() => isDraft && insertVariable(v)}
                disabled={!isDraft}
                className="rounded bg-muted text-foreground hover:bg-accent hover:text-accent-foreground px-2 py-1 font-mono text-xs disabled:opacity-50"
              >
                {v}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {showSimulator && (
        <PromptSimulator
          draftSystemPrompt={systemPrompt}
          draftUserPromptTemplate={userPromptTemplate}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}
