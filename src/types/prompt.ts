export type PromptStatus = 'draft' | 'published' | 'archived';

export interface PromptTemplate {
  _id: string;
  name: string;
  version: number;
  status: PromptStatus;
  systemPrompt: string;
  userPromptTemplate: string;
  notes: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
}

export interface SimulationColumnResult {
  userPromptRendered: string;
  warnings: string[];
  response: string | null;
  latencyMs: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  error: string | null;
  source?: 'published' | 'fallback' | 'draft';
  version?: number | 'draft';
  promptTemplateId?: string | null;
}

export interface SimulationPatient {
  id: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  // Backend changed age from Number to String in v3.0; accept both for
  // historical records that may still serialise as number.
  age: number | string;
  gender: string;
  ethnicity: string;
  questionnaire: Record<string, unknown>;
  photos: { url: string; key: string }[];
}

/**
 * A simulation runs in the background — a v3.10 analysis takes 3–5 minutes,
 * longer than the backend allows one request — so it is started, then polled.
 * `published` and `draft` are null until `status` leaves 'running'.
 */
export interface SimulationResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  patient: SimulationPatient;
  published: SimulationColumnResult | null;
  draft: SimulationColumnResult | null;
}

export interface CreatePromptPayload {
  name?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  notes?: string;
}

export interface UpdatePromptPayload {
  systemPrompt?: string;
  userPromptTemplate?: string;
  notes?: string;
}

export interface SimulatePayload {
  analysisId: string;
  draftSystemPrompt: string;
  draftUserPromptTemplate: string;
}
