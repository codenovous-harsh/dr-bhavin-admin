'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import promptService from '@/services/prompt.service';
import type { PromptTemplate } from '@/types/prompt';

const statusBadge: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export function PromptListTable() {
  const router = useRouter();
  const [rows, setRows] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await promptService.list('skin-analysis');
      setRows(data);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleNewDraft() {
    const published = rows.find((r) => r.status === 'published');
    const seed = published || rows[0];
    const created = await promptService.create({
      name: 'skin-analysis',
      systemPrompt: seed?.systemPrompt || '',
      userPromptTemplate: seed?.userPromptTemplate || '',
      notes: seed ? `Cloned from v${seed.version}` : '',
    });
    router.push(`/dashboard/prompts/${created._id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    await promptService.remove(id);
    load();
  }

  async function handlePublish(id: string) {
    if (!confirm('Publish this draft? The currently published version will be archived.')) return;
    try {
      await promptService.publish(id);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Publish failed');
    }
  }

  if (loading) return <div className="p-4 text-foreground">Loading…</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="space-y-4 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Prompts</h1>
        <button
          onClick={handleNewDraft}
          className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          New Draft
        </button>
      </div>

      <div className="rounded border border-border bg-card text-card-foreground overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border text-left">
              <th className="py-2 px-3">Version</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Notes</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Published</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No prompts yet. Create your first draft.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r._id}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className="py-2 px-3 font-mono">v{r.version}</td>
                <td className="py-2 px-3">
                  <span className={`rounded px-2 py-1 text-xs ${statusBadge[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="max-w-xs truncate py-2 px-3 text-foreground/90">{r.notes || '—'}</td>
                <td className="py-2 px-3 text-foreground/80">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="py-2 px-3 text-foreground/80">
                  {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : '—'}
                </td>
                <td className="space-x-3 py-2 px-3">
                  <Link
                    href={`/dashboard/prompts/${r._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {r.status === 'draft' ? 'Edit' : 'View'}
                  </Link>
                  {r.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handlePublish(r._id)}
                        className="text-green-700 dark:text-green-400 hover:underline"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
