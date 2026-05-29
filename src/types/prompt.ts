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
  systemPrompt: string;
  userPromptRendered: string;
  warnings: string[];
  response: string | null;
  latencyMs: number | null;
  error: string | null;
  source?: 'published' | 'fallback';
  version?: number;
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

export interface SimulationResult {
  patient: SimulationPatient;
  published: SimulationColumnResult;
  draft: SimulationColumnResult;
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
