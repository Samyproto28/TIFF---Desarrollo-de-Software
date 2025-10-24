import { apiClient } from './client';
import { LoginRequest, LoginResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store token in client
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.logout();
    }
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  isAuthenticated(): boolean {
    return apiClient.hasToken();
  },
};