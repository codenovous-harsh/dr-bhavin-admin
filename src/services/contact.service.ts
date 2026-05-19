import api from './auth.service';

export interface Contact {
  _id: string;
  email: string;
  name: string;
  tags: string[];
  source: 'manual' | 'bulk' | 'patient_import';
  subscribed: boolean;
  createdAt: string;
  lastSentAt: string | null;
}

export interface ContactListResponse {
  status: string;
  data: {
    contacts: Contact[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

export interface BulkAddSummary {
  added: number;
  skipped: number;
  invalid: number;
  total: number;
}

const URL = '/contacts';

class ContactService {
  async list(opts?: { page?: number; limit?: number; search?: string; subscribedOnly?: boolean }) {
    const response = await api.get<ContactListResponse>(URL, { params: opts });
    return response.data.data;
  }

  async create(payload: { email: string; name?: string; tags?: string[] }): Promise<Contact> {
    const response = await api.post<{ status: string; data: { contact: Contact } }>(URL, payload);
    return response.data.data.contact;
  }

  async bulkAdd(payload: { emails: string; tags?: string[] }): Promise<BulkAddSummary> {
    const response = await api.post<{ status: string; data: BulkAddSummary }>(`${URL}/bulk`, payload);
    return response.data.data;
  }

  async importPatients(): Promise<BulkAddSummary> {
    const response = await api.post<{ status: string; data: BulkAddSummary }>(`${URL}/import-patients`);
    return response.data.data;
  }

  async update(id: string, payload: { name?: string; tags?: string[]; subscribed?: boolean }): Promise<Contact> {
    const response = await api.patch<{ status: string; data: { contact: Contact } }>(
      `${URL}/${id}`,
      payload
    );
    return response.data.data.contact;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${URL}/${id}`);
  }
}

const contactService = new ContactService();
export default contactService;
