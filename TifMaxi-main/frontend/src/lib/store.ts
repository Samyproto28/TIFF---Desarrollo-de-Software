import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

interface FilterState {
  telegramasFilters: Record<string, any>;
  candidatosFilters: Record<string, any>;
  provinciasFilters: Record<string, any>;
  setTelegramasFilters: (filters: Record<string, any>) => void;
  setCandidatosFilters: (filters: Record<string, any>) => void;
  setProvinciasFilters: (filters: Record<string, any>) => void;
  clearAllFilters: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      telegramasFilters: {},
      candidatosFilters: {},
      provinciasFilters: {},
      setTelegramasFilters: (filters) => set({ telegramasFilters: filters }),
      setCandidatosFilters: (filters) => set({ candidatosFilters: filters }),
      setProvinciasFilters: (filters) => set({ provinciasFilters: filters }),
      clearAllFilters: () => set({ telegramasFilters: {}, candidatosFilters: {}, provinciasFilters: {} }),
    }),
    {
      name: 'filter-storage',
    }
  )
);