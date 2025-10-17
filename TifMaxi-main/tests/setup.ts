import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    toBlob: vi.fn((callback) => {
      // Create a mock blob
      const canvas = document.createElement('canvas');
      canvas.toBlob(callback);
    }),
  })),
  registerables: [],
}));

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
    downloadFile: vi.fn(),
  },
  navigate: {
    to: vi.fn(),
  },
  formatNumber: vi.fn((num: number) => num.toLocaleString()),
  formatPercentage: vi.fn((num: number) => `${num}%`),
  formatDate: vi.fn((date: string) => new Date(date).toLocaleDateString()),
}));

// Mock router
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
  },
  usePage: vi.fn(() => ({
    props: {},
    url: '/',
    component: null,
  })),
  Link: {
    template: '<a><slot /></a>',
  },
}));

// Mock Pinia stores
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    fetchUser: vi.fn(),
    register: vi.fn(),
    sendPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    deleteAccount: vi.fn(),
    initializeAuth: vi.fn(),
  })),
}));

vi.mock('@/stores/electoral', () => ({
  useElectoralStore: vi.fn(() => ({
    provincias: [],
    candidatos: [],
    estadisticas: null,
    rankingCandidatos: [],
    loading: false,
    error: null,
    loadProvincias: vi.fn(),
    loadCandidatos: vi.fn(),
    loadEstadisticas: vi.fn(),
    loadRankingCandidatos: vi.fn(),
    refreshData: vi.fn(),
    createCandidato: vi.fn(),
    updateCandidato: vi.fn(),
    deleteCandidato: vi.fn(),
    createProvincia: vi.fn(),
    updateProvincia: vi.fn(),
    deleteProvincia: vi.fn(),
    searchCandidatos: vi.fn(),
    searchProvincias: vi.fn(),
    filterCandidatos: vi.fn(),
    clearError: vi.fn(),
    initialize: vi.fn(),
  })),
}));

vi.mock('@/stores/ui', () => ({
  useUIStore: vi.fn(() => ({
    sidebarOpen: true,
    theme: 'light',
    loading: false,
    notifications: [],
    modals: {
      confirmDelete: false,
      createEdit: false,
      import: false,
      export: false,
      filter: false,
    },
    modalData: {
      confirmDelete: null,
      createEdit: null,
      import: null,
      export: null,
      filter: null,
    },
    breadcrumbs: [],
    pageLoading: false,
    fullscreenLoading: false,
    toggleSidebar: vi.fn(),
    setSidebarOpen: vi.fn(),
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    setLoading: vi.fn(),
    setPageLoading: vi.fn(),
    setFullscreenLoading: vi.fn(),
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
    clearNotifications: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    showConfirmDelete: vi.fn(),
    showCreateEdit: vi.fn(),
    showImport: vi.fn(),
    showExport: vi.fn(),
    showFilter: vi.fn(),
    setBreadcrumbs: vi.fn(),
    addBreadcrumb: vi.fn(),
    removeBreadcrumb: vi.fn(),
    clearBreadcrumbs: vi.fn(),
    initializeUI: vi.fn(),
    cleanup: vi.fn(),
  })),
}));

vi.mock('@/stores/notificaciones', () => ({
  useNotificacionesStore: vi.fn(() => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: null,
    filters: {},
    fetchNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    clearReadNotifications: vi.fn(),
    createNotification: vi.fn(),
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
    updateUnreadCount: vi.fn(),
    handleRealtimeNotification: vi.fn(),
    requestNotificationPermission: vi.fn(),
    initialize: vi.fn(),
    setupRealtimeNotifications: vi.fn(),
    cleanupExpiredNotifications: vi.fn(),
    processNotificationAction: vi.fn(),
    refresh: vi.fn(),
    loadMore: vi.fn(),
    searchNotifications: vi.fn(),
    getNotificationStats: vi.fn(),
  })),
}));

// Global test configuration
config.global.stubs = {
  'router-link': true,
  'inertia-link': true,
  transition: true,
  'transition-group': true,
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock Notification
vi.stubGlobal('Notification', {
  requestPermission: vi.fn(() => Promise.resolve('granted')),
  permission: 'granted',
});