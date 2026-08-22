import api from './auth.service';
import type { Enquiry, EnquiryListResponse, EnquiryStatus } from '@/types/enquiry';

const ENQUIRY_API_URL = '/enquiries';


export interface EnquiryStats {
  counts: { new: number; contacted: number; closed: number; spam: number };
  awaitingFollowUp: number;
  oldestUnactioned: {
    createdAt: string;
    name: string;
    email: string;
    ageDays: number;
  } | null;
  topSources: { label: string; count: number }[];
  topConcerns: { label: string; count: number }[];
  mix: { virtual: number; inClinic: number; newPatient: number };
  windowDays: number;
}

class EnquiryService {
  /** Dashboard analytics: follow-up backlog, lead sources, demand mix. */
  async getStats(days = 90): Promise<EnquiryStats> {
    const res = await api.get<{ data: EnquiryStats }>(
      `${ENQUIRY_API_URL}/stats`,
      { params: { days } }
    );
    return res.data.data;
  }

  async list(
    params: {
      page?: number;
      limit?: number;
      status?: EnquiryStatus;
      search?: string;
      /** '-field' | 'field'. Whitelisted server-side. */
      sortBy?: string;
    } = {}
  ) {
    const res = await api.get<EnquiryListResponse>(ENQUIRY_API_URL, { params });
    return res.data.data;
  }

  async updateStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
    const res = await api.patch<{ status: string; data: Enquiry }>(
      `${ENQUIRY_API_URL}/${id}`,
      { status }
    );
    return res.data.data;
  }
}

const enquiryService = new EnquiryService();
export default enquiryService;
