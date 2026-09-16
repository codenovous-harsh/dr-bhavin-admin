// 'spam' is set by the backend when a submission trips a bot signal. Such
// enquiries are stored but not emailed, so they must stay visible here — a
// false positive is reclassified by switching it back to 'new'.
export type EnquiryStatus = 'new' | 'contacted' | 'booked' | 'closed' | 'spam';

/**
 * One entry in an enquiry's case history — a staff note, or a status change.
 *
 * Both live in one list because the question this answers ("why was this
 * closed?") is only answerable when the reason and the decision sit together in
 * time. Append-only: nothing in the UI edits or deletes an entry.
 */
export interface EnquiryActivity {
  type: 'note' | 'status';
  body?: string;
  /** Populated on 'status' entries only. */
  fromStatus?: string;
  toStatus?: string;
  authorId?: string | null;
  authorName?: string;
  createdAt: string;
}

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
  activity?: EnquiryActivity[];
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
