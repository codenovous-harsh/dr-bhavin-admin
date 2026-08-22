import api from './auth.service';
import type {
  SkinAnalysis,
  SkinAnalysisFormData,
  SkinAnalysisResponse,
  SkinAnalysisFullResponse,
  SkinAnalysisListResponse,
  SkinAnalysisStatsResponse,
  SkinAnalysisQueryOptions,
} from '@/types/skinAnalysis';

const SKIN_ANALYSIS_API_URL = '/skin-analysis';

export interface SubmissionTrendPoint {
  label: string;
  year: number;
  week: number;
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

export interface SubmissionTrends {
  points: SubmissionTrendPoint[];
  delta: {
    current: number;
    previous: number;
    /** null when there is no prior period to compare against. */
    changePct: number | null;
  };
}

class SkinAnalysisService {
  /**
   * Submit skin analysis with photos and questionnaire
   * @param formData - Complete form data including user info, questionnaire, and photos
   * @returns Analysis result with AI recommendations
   */
  async submitAnalysis(formData: SkinAnalysisFormData): Promise<SkinAnalysisResponse> {
    // Create FormData for multipart upload
    const data = new FormData();

    // Add user information. lastName/phone are optional in v3.0; coerce to
    // empty strings so FormData.append doesn't blow up on undefined.
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName ?? '');
    if (formData.fullName !== undefined) data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('age', String(formData.age));
    data.append('phone', formData.phone ?? '');
    data.append('gender', formData.gender);
    data.append('ethnicity', formData.ethnicity);

    // Add questionnaire as JSON string
    data.append('questionnaire', JSON.stringify(formData.questionnaire));

    // Add photos
    formData.photos.forEach((photo) => {
      data.append('photos', photo);
    });

    const response = await api.post<SkinAnalysisResponse>(
      `${SKIN_ANALYSIS_API_URL}/analyze`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Get analysis by ID
   * @param id - Analysis ID
   * @returns Full analysis data
   */
  async getAnalysisById(id: string): Promise<SkinAnalysis> {
    const response = await api.get<SkinAnalysisFullResponse>(
      `${SKIN_ANALYSIS_API_URL}/${id}`
    );

    return response.data.data;
  }

  /**
   * Get all analyses for a user by email
   * @param email - User's email address
   * @param options - Query options (pagination, filters)
   * @returns List of analyses with pagination
   */
  async getAnalysesByEmail(
    email: string,
    options?: SkinAnalysisQueryOptions
  ): Promise<SkinAnalysisListResponse> {
    const response = await api.get<SkinAnalysisListResponse>(
      `${SKIN_ANALYSIS_API_URL}/user/${encodeURIComponent(email)}`,
      {
        params: options,
      }
    );

    return response.data;
  }

  /**
   * Get all analyses with pagination and filters (Admin only)
   * @param options - Query options (pagination, filters)
   * @returns List of all analyses with pagination
   */
  async getAllAnalyses(
    options?: SkinAnalysisQueryOptions & {
      sortBy?: string;
      search?: string;
    }
  ): Promise<SkinAnalysisListResponse> {
    const response = await api.get<SkinAnalysisListResponse>(
      `${SKIN_ANALYSIS_API_URL}/admin/all`,
      {
        params: options,
      }
    );

    return response.data;
  }

  /**
   * Send a manual email to the patient for a specific analysis (Admin only)
   */
  async sendPatientEmail(
    id: string,
    payload: { subject: string; message: string }
  ): Promise<{ status: string; message: string; data: { emailHistory: any[] } }> {
    const response = await api.post(`${SKIN_ANALYSIS_API_URL}/${id}/email`, payload);
    return response.data;
  }

  /**
   * Send the Tier 1 report email to the patient for a specific analysis (Admin only)
   */
  async sendAnalysisReport(
    id: string
  ): Promise<{ status: string; message: string; data: { emailHistory: any[] } }> {
    const response = await api.post(`${SKIN_ANALYSIS_API_URL}/${id}/email-report`);
    return response.data;
  }

  /**
   * Get analysis statistics (Admin only)
   * @returns Analysis statistics
   */
  async getAnalysisStats(): Promise<SkinAnalysisStatsResponse> {
    const response = await api.get<SkinAnalysisStatsResponse>(
      `${SKIN_ANALYSIS_API_URL}/stats/summary`
    );

    return response.data;
  }

  /**
   * Weekly submission trends (zero-filled) plus a real 7-day-over-7-day delta.
   */
  async getSubmissionTrends(weeks = 6): Promise<SubmissionTrends> {
    const response = await api.get<{ data: SubmissionTrends }>(
      `${SKIN_ANALYSIS_API_URL}/stats/trends`,
      { params: { weeks } }
    );

    return response.data.data;
  }
}

// Export singleton instance
const skinAnalysisService = new SkinAnalysisService();
export default skinAnalysisService;
