'use client';

import { useEffect, useRef, useState } from 'react';
import { PatientPicker } from './patient-picker';
import { SimulationResultColumn } from './simulation-result-column';
import promptService from '@/services/prompt.service';
import type { SimulationResult } from '@/types/prompt';
import type { SkinAnalysis } from '@/types/skinAnalysis';

// A v3.10 pair takes 3–5 minutes. Poll often enough to feel live, and give up
// well after the backend would have marked a stuck run as failed (20 min).
const POLL_MS = 5000;
const GIVE_UP_MS = 25 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Props {
  draftSystemPrompt: string;
  draftUserPromptTemplate: string;
  onClose: () => void;
}

export function PromptSimulator({ draftSystemPrompt, draftUserPromptTemplate, onClose }: Props) {
  const [step, setStep] = useState<'pick' | 'compare'>('pick');
  const [patient, setPatient] = useState<SkinAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  // Bumped on every new run and on close, so a poll loop that outlives its run
  // (retry, different patient, dialog closed) stops instead of writing stale state.
  const runRef = useRef(0);

  useEffect(() => {
    return () => {
      runRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const started = Date.now();
    setElapsed(0);
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [loading]);

  async function runSimulation(analysisId: string) {
    const run = ++runRef.current;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let data = await promptService.startSimulation({
        analysisId,
        draftSystemPrompt,
        draftUserPromptTemplate,
      });
      const startedAt = Date.now();
      while (data.status === 'running') {
        if (Date.now() - startedAt > GIVE_UP_MS) {
          throw new Error('The simulation is taking far longer than expected. Try again.');
        }
        await sleep(POLL_MS);
        if (run !== runRef.current) return;
        data = await promptService.getSimulation(data.id);
      }
      if (run !== runRef.current) return;
      if (data.status === 'failed') {
        setError(data.error || 'Simulation failed');
      }
      setResult(data);
    } catch (e: unknown) {
      if (run !== runRef.current) return;
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Simulation failed');
    } finally {
      if (run === runRef.current) setLoading(false);
    }
  }

  function handlePatientSelect(analysisId: string, summary: SkinAnalysis) {
    setPatient(summary);
    setStep('compare');
    runSimulation(analysisId);
  }

  function handleRetry() {
    if (patient) runSimulation(patient._id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded bg-card text-card-foreground shadow-xl border border-border">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Simulate Prompt</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {step === 'pick' && <PatientPicker onSelect={handlePatientSelect} />}

          {step === 'compare' && patient && (
            <div className="space-y-4">
              <div className="rounded bg-muted p-3 text-sm text-foreground">
                <div className="font-medium">
                  {patient.firstName} {patient.lastName}, {patient.age}, {patient.gender}, {patient.ethnicity}
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {(patient.photos || []).map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt={`photo ${i}`}
                      className="h-20 w-20 flex-shrink-0 rounded object-cover"
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    runRef.current += 1;
                    setLoading(false);
                    setStep('pick');
                    setResult(null);
                    setError(null);
                  }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Pick a different patient
                </button>
              </div>

              {loading && (
                <div className="rounded bg-muted p-3 text-sm text-muted-foreground">
                  Running the full analysis with both prompts — the same two-call pipeline a
                  patient gets. This usually takes 3–5 minutes ({Math.floor(elapsed / 60)}:
                  {String(elapsed % 60).padStart(2, '0')} so far) and costs about the same as two
                  real analyses. You can leave this open; closing it won&apos;t stop the run.
                </div>
              )}

              {error && (
                <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SimulationResultColumn
                  title={
                    result?.published?.source === 'fallback'
                      ? 'Fallback (no published prompt)'
                      : `Currently Published — v${result?.published?.version ?? '?'}`
                  }
                  loading={loading}
                  result={result?.published || null}
                  onRetry={handleRetry}
                />
                <SimulationResultColumn
                  title="Your Draft"
                  loading={loading}
                  result={result?.draft || null}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
