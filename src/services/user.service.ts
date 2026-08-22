import api from './auth.service';
import type { User } from './auth.service';

export interface StaffUserListResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

export interface StaffUserResponse {
  status: string;
  message: string;
  data: { user: User };
}

class UserService {
  async listUsers(opts?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
    /** '-field' | 'field'. Whitelisted server-side. */
    sortBy?: string;
  }) {
    const response = await api.get<StaffUserListResponse>('/auth/users', { params: opts });
    return response.data.data;
  }

  async createUser(payload: {
    name: string;
    email: string;
    password: string;
    role: 'editor' | 'admin';
  }) {
    const response = await api.post<StaffUserResponse>('/auth/users', payload);
    return response.data.data.user;
  }

  async updateUser(
    id: string,
    payload: { role?: 'editor' | 'admin' | 'user'; isActive?: boolean; name?: string }
  ) {
    const response = await api.patch<StaffUserResponse>(`/auth/users/${id}`, payload);
    return response.data.data.user;
  }

  async deleteUser(id: string, opts?: { hard?: boolean }) {
    const response = await api.delete(`/auth/users/${id}`, {
      params: opts?.hard ? { hard: 'true' } : undefined,
    });
    return response.data;
  }
}

const userService = new UserService();
export default userService;
