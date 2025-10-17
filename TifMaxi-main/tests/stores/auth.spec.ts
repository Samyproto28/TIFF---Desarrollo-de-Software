import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    
    // Clear localStorage
    localStorage.clear();
    
    // Reset store state
    authStore.$reset();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.loading).toBe(false);
    });

    it('should initialize with token from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('auth_token', token);
      
      const newStore = useAuthStore();
      expect(newStore.token).toBe(token);
    });
  });

  describe('getters', () => {
    it('should return correct isLoggedIn value', () => {
      expect(authStore.isLoggedIn).toBe(false);
      
      authStore.token = 'test-token';
      authStore.isAuthenticated = true;
      expect(authStore.isLoggedIn).toBe(true);
    });

    it('should return correct user values', () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };
      
      authStore.user = mockUser;
      
      expect(authStore.userName).toBe('Test User');
      expect(authStore.userEmail).toBe('test@example.com');
      expect(authStore.hasVerifiedEmail).toBe(true);
      expect(authStore.userAvatar).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password',
        remember: false,
      };
      
      const mockResponse = {
        token: 'test-token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          email_verified_at: '2023-01-01',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      };
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockResolvedValue(mockResponse);
      
      await authStore.login(credentials);
      
      expect(authStore.token).toBe(mockResponse.token);
      expect(authStore.user).toEqual(mockResponse.user);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.loading).toBe(false);
      expect(localStorage.getItem('auth_token')).toBe(mockResponse.token);
    });

    it('should handle login errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      
      const error = new Error('Invalid credentials');
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockRejectedValue(error);
      
      await expect(authStore.login(credentials)).rejects.toThrow(error);
      
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Set up logged in state
      authStore.token = 'test-token';
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };
      authStore.isAuthenticated = true;
      localStorage.setItem('auth_token', 'test-token');
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockResolvedValue({});
      
      await authStore.logout();
      
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should handle logout errors', async () => {
      // Set up logged in state
      authStore.token = 'test-token';
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };
      authStore.isAuthenticated = true;
      localStorage.setItem('auth_token', 'test-token');
      
      const error = new Error('Network error');
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockRejectedValue(error);
      
      await authStore.logout();
      
      // Should still logout even on error
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      authStore.token = 'old-token';
      authStore.isAuthenticated = true;
      
      const mockResponse = {
        token: 'new-token',
      };
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockResolvedValue(mockResponse);
      
      await authStore.refresh();
      
      expect(authStore.token).toBe('new-token');
      expect(localStorage.getItem('auth_token')).toBe('new-token');
    });

    it('should handle refresh errors', async () => {
      authStore.token = 'old-token';
      authStore.isAuthenticated = true;
      
      const error = new Error('Invalid token');
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockRejectedValue(error);
      
      await expect(authStore.refresh()).rejects.toThrow(error);
      
      // Should logout on refresh error
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('should fetch user successfully', async () => {
      authStore.token = 'test-token';
      
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.get.mockResolvedValue({ data: mockUser });
      
      await authStore.fetchUser();
      
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should handle fetch user errors', async () => {
      authStore.token = 'test-token';
      
      const error = new Error('User not found');
      const { api } = vi.importActual('@/lib/api') as any;
      api.get.mockRejectedValue(error);
      
      await expect(authStore.fetchUser()).rejects.toThrow(error);
      
      // Should logout on fetch user error
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should register and login successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'password',
      };
      
      const mockResponse = {
        token: 'test-token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          email_verified_at: null,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      };
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockResolvedValue(mockResponse);
      
      await authStore.register(userData);
      
      expect(authStore.token).toBe(mockResponse.token);
      expect(authStore.user).toEqual(mockResponse.user);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should handle registration errors', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'different-password',
      };
      
      const error = new Error('Password confirmation does not match');
      const { api } = vi.importActual('@/lib/api') as any;
      api.post.mockRejectedValue(error);
      
      await expect(authStore.register(userData)).rejects.toThrow(error);
      
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('initializeAuth', () => {
    it('should initialize auth state from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('auth_token', token);
      
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: '2023-01-01',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };
      
      const { api } = vi.importActual('@/lib/api') as any;
      api.get.mockResolvedValue({ data: mockUser });
      
      authStore.initializeAuth();
      
      expect(authStore.token).toBe(token);
    });

    it('should handle invalid token in localStorage', () => {
      const token = 'invalid-token';
      localStorage.setItem('auth_token', token);
      
      const error = new Error('Invalid token');
      const { api } = vi.importActual('@/lib/api') as any;
      api.get.mockRejectedValue(error);
      
      authStore.initializeAuth();
      
      // Should clear invalid token
      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});