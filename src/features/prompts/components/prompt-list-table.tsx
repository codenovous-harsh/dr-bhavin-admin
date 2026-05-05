'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import promptService from '@/services/prompt.service';
import type { PromptTemplate } from '@/types/prompt';

const statusBadge: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-700',
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

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Prompts</h1>
        <button
          onClick={handleNewDraft}
          className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          New Draft
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">Version</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Notes</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4">Published</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                No prompts yet. Create your first draft.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r._id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4 font-mono">v{r.version}</td>
              <td className="py-2 pr-4">
                <span className={`rounded px-2 py-1 text-xs ${statusBadge[r.status]}`}>{r.status}</span>
              </td>
              <td className="max-w-xs truncate py-2 pr-4">{r.notes || '—'}</td>
              <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="py-2 pr-4">{r.publishedAt ? new Date(r.publishedAt).toLocaleString() : '—'}</td>
              <td className="space-x-2 py-2">
                <Link href={`/dashboard/prompts/${r._id}`} className="text-blue-600 hover:underline">
                  {r.status === 'draft' ? 'Edit' : 'View'}
                </Link>
                {r.status === 'draft' && (
                  <>
                    <button onClick={() => handlePublish(r._id)} className="text-green-700 hover:underline">
                      Publish
                    </button>
                    <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:underline">
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
  );
}
