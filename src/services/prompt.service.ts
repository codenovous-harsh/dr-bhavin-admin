import api from './auth.service';
import type {
  PromptTemplate,
  CreatePromptPayload,
  UpdatePromptPayload,
  SimulatePayload,
  SimulationResult,
} from '@/types/prompt';

const BASE = '/prompts';

interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

class PromptService {
  /**
   * Paginated prompt versions. The endpoint now returns
   * { items, pagination } instead of a bare array.
   */
  async list(params: {
    name?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: PromptTemplate[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await api.get<
      ApiEnvelope<{
        items: PromptTemplate[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(BASE, { params: { name: 'skin-analysis', ...params } });
    return res.data.data;
  }

  async getById(id: string): Promise<PromptTemplate> {
    const res = await api.get<ApiEnvelope<PromptTemplate>>(`${BASE}/${id}`);
    return res.data.data;
  }

  async getPublished(name = 'skin-analysis'): Promise<PromptTemplate | null> {
    try {
      const res = await api.get<ApiEnvelope<PromptTemplate>>(`${BASE}/published`, { params: { name } });
      return res.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 404) return null;
      throw e;
    }
  }

  async create(payload: CreatePromptPayload): Promise<PromptTemplate> {
    const res = await api.post<ApiEnvelope<PromptTemplate>>(BASE, payload);
    return res.data.data;
  }

  async update(id: string, payload: UpdatePromptPayload): Promise<PromptTemplate> {
    const res = await api.put<ApiEnvelope<PromptTemplate>>(`${BASE}/${id}`, payload);
    return res.data.data;
  }

  async publish(id: string): Promise<{ published: PromptTemplate; archived: PromptTemplate | null }> {
    const res = await api.post<ApiEnvelope<{ published: PromptTemplate; archived: PromptTemplate | null }>>(
      `${BASE}/${id}/publish`
    );
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  }

  async simulate(payload: SimulatePayload): Promise<SimulationResult> {
    const res = await api.post<ApiEnvelope<SimulationResult>>(`${BASE}/simulate`, payload);
    return res.data.data;
  }
}

const promptService = new PromptService();
export default promptService;
