'use client';

import { useState } from 'react';
import { PatientPicker } from './patient-picker';
import { SimulationResultColumn } from './simulation-result-column';
import promptService from '@/services/prompt.service';
import type { SimulationResult } from '@/types/prompt';
import type { SkinAnalysis } from '@/types/skinAnalysis';

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

  async function runSimulation(analysisId: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await promptService.simulate({
        analysisId,
        draftSystemPrompt,
        draftUserPromptTemplate,
      });
      setResult(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Simulation failed');
    } finally {
      setLoading(false);
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
                    setStep('pick');
                    setResult(null);
                    setError(null);
                  }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Pick a different patient
                </button>
              </div>

              {error && (
                <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SimulationResultColumn
                  title={
                    result?.published.source === 'fallback'
                      ? 'Fallback (no published prompt)'
                      : `Currently Published — v${result?.published.version ?? '?'}`
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
