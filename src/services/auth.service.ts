import axios, { AxiosError } from 'axios';

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only auto-logout if we have a token (i.e., this is an authenticated request)
      // Don't auto-logout on login failures
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');

      if (hasToken && !isLoginRequest) {
        // This is an authenticated request that failed - token likely expired
        console.warn('Authentication expired, redirecting to login...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear cookie
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
          window.location.href = '/auth/sign-in';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: any;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

// Auth Service Class
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.data.token) {
        this.setSession(response.data.data.token, response.data.data.user);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);

      if (response.data.data.token) {
        this.setSession(response.data.data.token, response.data.data.user);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      return response.data.data!.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
      }
      throw error;
    }
  }

  /**
   * Validate token
   */
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { valid: false };
      }

      const response = await api.get<ApiResponse<{ valid: boolean; user: User }>>('/auth/validate');
      return response.data.data!;
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update password');
      }
      throw error;
    }
  }

  /**
   * Request a password reset email
   */
  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    try {
      const response = await api.post<{ status: string; message: string }>(
        '/auth/forgot-password',
        { email }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send reset email');
      }
      throw error;
    }
  }

  /**
   * Reset password using a token from the reset email
   */
  async resetPassword(token: string, password: string): Promise<{ status: string; message: string }> {
    try {
      const response = await api.post<{ status: string; message: string }>(
        '/auth/reset-password',
        { token, password }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to reset password');
      }
      throw error;
    }
  }

  /**
   * Update profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<{ user: User }>>('/auth/update-profile', data);
      const user = response.data.data!.user;

      // Update stored user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  }

  /**
   * Set session (store token and user)
   */
  private setSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Also store token in cookie for middleware access
      // Set cookie to expire in 7 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  }

  /**
   * Clear session
   */
  private clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export api instance for other services
export default api;