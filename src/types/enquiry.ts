// 'spam' is set by the backend when a submission trips a bot signal. Such
// enquiries are stored but not emailed, so they must stay visible here — a
// false positive is reclassified by switching it back to 'new'.
export type EnquiryStatus = 'new' | 'contacted' | 'booked' | 'closed' | 'spam';

/**
 * Every status, in workflow order. The single source for any UI that offers a
 * choice of status.
 *
 * It exists because the list was previously written out by hand in four places,
 * and they drifted: the detail panel offered four options and silently omitted
 * 'booked', so an enquiry could be moved into that state from the table but
 * never out of it from the panel. A union type does not protect against a
 * missing member — only against a wrong one — so the list has to be derived
 * from one place rather than retyped.
 *
 * Mirrors the enum on the backend Enquiry model; change both together.
 */
export const ENQUIRY_STATUSES: readonly EnquiryStatus[] = [
  'new',
  'contacted',
  'booked',
  'closed',
  'spam'
] as const;

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
  /** Optional on the type because enquiries predating the phone field have none. */
  phone?: string;
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
