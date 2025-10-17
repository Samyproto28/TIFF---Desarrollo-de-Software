import { defineStore } from 'pinia';
import { router } from '@inertiajs/vue3';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    userName: (state) => state.user?.name || '',
    userAvatar: (state) => state.user?.avatar || null,
    userEmail: (state) => state.user?.email || '',
    hasVerifiedEmail: (state) => !!state.user?.email_verified_at,
  },

  actions: {
    async login(credentials: { email: string; password: string; remember?: boolean }) {
      this.loading = true;
      
      try {
        const response = await api.post('/login', credentials) as {
          token: string;
          user: User;
        };
        
        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        
        // Set authorization header for future requests
        // Note: This would need to be implemented in the API client
        // For now, we'll store the token and include it in each request
        
        return response;
      } catch (error: any) {
        this.logout();
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      
      try {
        if (this.token) {
          await api.post('/logout', {});
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear state
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.loading = false;
        
        // Clear localStorage
        localStorage.removeItem('auth_token');
        
        // Clear authorization header
        // Note: This would need to be implemented in the API client
        // For now, we'll just clear the token from localStorage
        
        // Redirect to login
        router.visit('/login');
      }
    },

    async refresh() {
      if (!this.token) {
        throw new Error('No token available for refresh');
      }
      
      try {
        const response = await api.post('/refresh', {}) as { token: string };
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
        return response;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async fetchUser() {
      if (!this.token) {
        throw new Error('No token available for fetching user');
      }
      
      try {
        const response = await api.get('/api/user') as { data: User };
        this.user = response.data;
        this.isAuthenticated = true;
        return response.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async register(userData: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) {
      this.loading = true;
      
      try {
        const response = await api.post('/register', userData);
        
        // Auto-login after successful registration
        await this.login({
          email: userData.email,
          password: userData.password,
        });
        
        return response;
      } catch (error: any) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async sendPasswordReset(email: string) {
      this.loading = true;
      
      try {
        const response = await api.post('/forgot-password', { email });
        return response;
      } catch (error: any) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(data: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) {
      this.loading = true;
      
      try {
        const response = await api.post('/reset-password', data);
        return response;
      } catch (error: any) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(userData: Partial<User>) {
      this.loading = true;
      
      try {
        const response = await api.put('/api/user/profile', userData) as { data: User };
        this.user = response.data;
        return response.data;
      } catch (error: any) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePassword(data: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) {
      this.loading = true;
      
      try {
        const response = await api.put('/api/user/password', data);
        return response;
      } catch (error: any) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount(password: string) {
      this.loading = true;
      
      try {
        // The API client doesn't support data parameter for DELETE
        // This would need to be implemented in the backend
        // For now, we'll use POST with _method: DELETE
        await api.post('/api/user/account/delete', {
          _method: 'DELETE',
          password
        });
        this.logout();
      } catch (error: any) {
        this.loading = false;
        throw error;
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
        // Set authorization header for future requests
        // Note: This would need to be implemented in the API client
        
        // Try to fetch user data
        this.fetchUser().catch(() => {
          // If fetch fails, clear invalid token
          this.logout();
        });
      }
    },

    // Token refresh interceptor setup
    setupTokenRefresh() {
      // This would typically be set up as an axios interceptor
      // For now, we'll implement a simple token refresh check
      setInterval(async () => {
        if (this.token && this.isAuthenticated) {
          try {
            // Check if token is about to expire (this would depend on your JWT implementation)
            // For now, we'll just refresh every 30 minutes
            await this.refresh();
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }
      }, 30 * 60 * 1000); // 30 minutes
    },
  },
});