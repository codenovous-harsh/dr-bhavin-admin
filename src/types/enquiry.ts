// 'spam' is set by the backend when a submission trips a bot signal. Such
// enquiries are stored but not emailed, so they must stay visible here — a
// false positive is reclassified by switching it back to 'new'.
export type EnquiryStatus = 'new' | 'contacted' | 'closed' | 'spam';

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  concern?: string;
  consultationFormat?: string;
  preferredClinic?: string;
  appointmentType?: string;
  notes?: string;
  /** Path of the page the form was submitted from, e.g. /concerns/face/frown-lines */
  sourcePath?: string;
  /** Page title at submission time — a readable label for sourcePath. */
  sourceTitle?: string;
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
