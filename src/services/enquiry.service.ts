import api from './auth.service';
import type { Enquiry, EnquiryListResponse, EnquiryStatus } from '@/types/enquiry';

const ENQUIRY_API_URL = '/enquiries';

class EnquiryService {
  async list(params: { page?: number; limit?: number; status?: EnquiryStatus } = {}) {
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
