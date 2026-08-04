export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  concern?: string;
  consultationFormat?: string;
  preferredClinic?: string;
  appointmentType?: string;
  notes?: string;
  status: EnquiryStatus;
  source?: string;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryListResponse {
  status: string;
  data: {
    enquiries: Enquiry[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}
