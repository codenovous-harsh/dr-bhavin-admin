import api from './auth.service';

// Clinical research: studies (CMS) and volunteer applications.
// Reuses the shared axios instance from auth.service so the bearer token
// interceptor and base URL are identical to every other admin service.

const STUDIES = '/research/studies';
const APPLICATIONS = '/research/applications';

export type StudyStatus = 'draft' | 'published' | 'archived';
export type RecruitmentStatus = 'recruiting' | 'closed' | 'completed';

export interface ResearchStudy {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  commitment: string;
  compensation: string;

  sponsor: string;
  classification: string;
  protocolRef: string;
  approvalBody: string;
  approvalReference: string;
  approvalDate: string | null;
  participantInfoUrl: string;
  infoSheetVersion: number;
  risks: string;
  withdrawalRights: string;
  dataHandling: string;
  complaintsRoute: string;

  status: StudyStatus;
  recruitmentStatus: RecruitmentStatus;
  publishedAt: string | null;
  displayOrder: number;
  capacity: number | null;
  applicationCount: number;

  /** Governance fields still blank. Non-empty means publishing is blocked. */
  missingGovernanceFields: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  studies: { studyId: string; slug: string; title: string; infoSheetVersion: number }[];
  smoker: string;
  recentInjectables: string;
  previousTreatments: string;
  message: string;
  consent: { acceptedAt: string; ipAddress: string | null };
  status: 'new' | 'screening' | 'eligible' | 'ineligible' | 'enrolled' | 'withdrawn';
  internalNotes: { note: string; by: string | null; at: string }[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

class ResearchService {
  // ---- Studies ----
  async listStudies(params: { page?: number; limit?: number; status?: string } = {}) {
    const res = await api.get(`${STUDIES}/admin/all`, { params });
    return res.data.data as { studies: ResearchStudy[]; pagination: Pagination };
  }

  async getStudy(id: string) {
    const res = await api.get(`${STUDIES}/${id}`);
    return res.data.data as ResearchStudy;
  }

  async createStudy(payload: Partial<ResearchStudy>) {
    const res = await api.post(STUDIES, payload);
    return res.data.data as ResearchStudy;
  }

  async updateStudy(id: string, payload: Partial<ResearchStudy>) {
    const res = await api.patch(`${STUDIES}/${id}`, payload);
    return res.data.data as ResearchStudy;
  }

  /**
   * Publish. The backend refuses with 409 and a `missing` list when governance
   * is incomplete — surfaced here so the caller can show exactly what is
   * outstanding rather than a generic failure.
   */
  async publishStudy(id: string): Promise<{ ok: true; study: ResearchStudy } | { ok: false; missing: string[]; message: string }> {
    try {
      const res = await api.patch(`${STUDIES}/${id}/publish`);
      return { ok: true, study: res.data.data as ResearchStudy };
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; data?: { missing?: string[] } } } };
      if (e.response?.status === 409) {
        return {
          ok: false,
          missing: e.response.data?.data?.missing ?? [],
          message: e.response.data?.message ?? 'This study cannot be published yet.',
        };
      }
      throw err;
    }
  }

  async unpublishStudy(id: string) {
    const res = await api.patch(`${STUDIES}/${id}/unpublish`);
    return res.data.data as ResearchStudy;
  }

  /** Archive, never delete — applications reference studies by id. */
  async archiveStudy(id: string) {
    const res = await api.patch(`${STUDIES}/${id}/archive`);
    return res.data.data as ResearchStudy;
  }

  // ---- Applications ----
  async listApplications(params: { page?: number; limit?: number; status?: string; studyId?: string } = {}) {
    const res = await api.get(APPLICATIONS, { params });
    return res.data.data as { applications: StudyApplication[]; pagination: Pagination };
  }

  async updateApplication(id: string, payload: { status?: string; note?: string }) {
    const res = await api.patch(`${APPLICATIONS}/${id}`, payload);
    return res.data.data as StudyApplication;
  }
}

export const researchService = new ResearchService();
export default researchService;
