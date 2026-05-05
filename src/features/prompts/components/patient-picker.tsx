'use client';

import { useEffect, useState } from 'react';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type { SkinAnalysis } from '@/types/skinAnalysis';

export function PatientPicker({ onSelect }: { onSelect: (analysisId: string, summary: SkinAnalysis) => void }) {
  const [rows, setRows] = useState<SkinAnalysis[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await skinAnalysisService.getAllAnalyses({
        page: 1,
        limit: 50,
        status: 'completed',
        search: search || undefined,
      });
      setRows(res.data.analyses as SkinAnalysis[]);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleConfirm() {
    const row = rows.find((r) => r._id === selectedId);
    if (row) onSelect(row._id, row);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') load();
          }}
          placeholder="Search by name or email"
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button onClick={load} className="rounded border px-3 py-2 text-sm">
          Search
        </button>
      </div>

      {loading && <div className="p-4">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="max-h-96 overflow-auto rounded border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Age</th>
                <th className="p-2 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No completed analyses found.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r._id}
                  onClick={() => setSelectedId(r._id)}
                  className={`cursor-pointer border-t hover:bg-gray-50 ${
                    selectedId === r._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-2">
                    <input type="radio" checked={selectedId === r._id} readOnly />
                  </td>
                  <td className="p-2">
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.age}</td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button
          disabled={!selectedId}
          onClick={handleConfirm}
          className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Use this case
        </button>
      </div>
    </div>
  );
}
