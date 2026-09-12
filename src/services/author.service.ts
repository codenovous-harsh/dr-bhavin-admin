import api from './auth.service';
import type { Author, AuthorListResponse, AuthorPayload, AuthorResponse } from '@/types/author';

const AUTHOR_API_URL = '/authors';

class AuthorService {
  /**
   * Every author, inactive included, with post counts. The public
   * `GET /authors` is a different, narrower list — the CMS needs the ones with
   * no posts yet and the ones that have been deactivated.
   */
  async getAuthors(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
  }): Promise<AuthorListResponse['data']> {
    const response = await api.get<AuthorListResponse>(`${AUTHOR_API_URL}/admin/all`, {
      params: { limit: 100, ...params }
    });
    return response.data.data;
  }

  async getAuthorById(id: string): Promise<Author> {
    const response = await api.get<AuthorResponse>(`${AUTHOR_API_URL}/${id}`);
    return response.data.data;
  }

  async createAuthor(payload: AuthorPayload): Promise<Author> {
    try {
      const response = await api.post<AuthorResponse>(AUTHOR_API_URL, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create author');
    }
  }

  async updateAuthor(id: string, payload: Partial<AuthorPayload>): Promise<Author> {
    try {
      const response = await api.put<AuthorResponse>(`${AUTHOR_API_URL}/${id}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update author');
    }
  }

  /**
   * Delete an author. The backend refuses while they still have posts unless
   * `reassignTo` names the author who should inherit them — deleting the record
   * under a live byline would point it at a 404.
   */
  async deleteAuthor(id: string, reassignTo?: string): Promise<{ reassignedCount: number }> {
    try {
      const response = await api.delete<{
        status: string;
        message: string;
        data: { reassignedCount: number };
      }>(`${AUTHOR_API_URL}/${id}`, {
        params: reassignTo ? { reassignTo } : undefined
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete author');
    }
  }
}

export const authorService = new AuthorService();
export default authorService;
