import { defineStore } from 'pinia';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];
  modals: {
    confirmDelete: boolean;
    createEdit: boolean;
    import: boolean;
    export: boolean;
    filter: boolean;
  };
  modalData: {
    confirmDelete: {
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    } | null;
    createEdit: {
      mode: 'create' | 'edit';
      item: any;
      itemType: string;
    } | null;
    import: {
      title: string;
      description: string;
      onImport: (file: File) => void;
      acceptedTypes: string[];
      maxSize: number;
    } | null;
    export: {
      title: string;
      description: string;
      onExport: (format: string) => void;
      formats: string[];
    } | null;
    filter: {
      title: string;
      filters: any;
      onApply: (filters: any) => void;
      onReset: () => void;
    } | null;
  };
  breadcrumbs: Array<{
    title: string;
    href?: string;
  }>;
  pageLoading: boolean;
  fullscreenLoading: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
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
  }),

  getters: {
    hasNotifications: (state) => state.notifications.length > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.persistent),
    activeModal: (state) => {
      for (const [modal, isOpen] of Object.entries(state.modals)) {
        if (isOpen) return modal;
      }
      return null;
    },
    isDarkMode: (state) => state.theme === 'dark',
    currentModalData: (state) => {
      for (const [modal, isOpen] of Object.entries(state.modals)) {
        if (isOpen) return state.modalData[modal as keyof typeof state.modalData];
      }
      return null;
    },
  },

  actions: {
    // Sidebar
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      localStorage.setItem('sidebar_open', String(this.sidebarOpen));
    },
    
    setSidebarOpen(open: boolean) {
      this.sidebarOpen = open;
      localStorage.setItem('sidebar_open', String(open));
    },

    // Theme
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      
      // Apply theme to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },

    // Loading states
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    
    setPageLoading(loading: boolean) {
      this.pageLoading = loading;
    },
    
    setFullscreenLoading(loading: boolean) {
      this.fullscreenLoading = loading;
    },

    // Notifications
    addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };

      this.notifications.push(newNotification);

      // Auto-remove notification after duration
      if (!notification.persistent && notification.duration !== 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, notification.duration || 5000);
      }
    },

    removeNotification(id: string) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearNotifications() {
      this.notifications = [];
    },

    // Convenience methods for common notifications
    showSuccess(title: string, message: string, options?: Partial<Notification>) {
      this.addNotification({
        type: 'success',
        title,
        message,
        ...options,
      });
    },

    showError(title: string, message: string, options?: Partial<Notification>) {
      this.addNotification({
        type: 'error',
        title,
        message,
        persistent: true,
        ...options,
      });
    },

    showWarning(title: string, message: string, options?: Partial<Notification>) {
      this.addNotification({
        type: 'warning',
        title,
        message,
        ...options,
      });
    },

    showInfo(title: string, message: string, options?: Partial<Notification>) {
      this.addNotification({
        type: 'info',
        title,
        message,
        ...options,
      });
    },

    // Modals
    openModal(modal: keyof UIState['modals'], data?: any) {
      this.modals[modal] = true;
      if (data) {
        this.modalData[modal] = data;
      }
    },

    closeModal(modal?: keyof UIState['modals']) {
      if (modal) {
        this.modals[modal] = false;
        this.modalData[modal] = null;
      } else {
        // Close all modals
        Object.keys(this.modals).forEach(key => {
          this.modals[key as keyof UIState['modals']] = false;
        });
        Object.keys(this.modalData).forEach(key => {
          this.modalData[key as keyof typeof this.modalData] = null;
        });
      }
    },

    // Confirm Delete Modal
    showConfirmDelete(options: {
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) {
      this.openModal('confirmDelete', options);
    },

    // Create/Edit Modal
    showCreateEdit(options: {
      mode: 'create' | 'edit';
      item: any;
      itemType: string;
    }) {
      this.openModal('createEdit', options);
    },

    // Import Modal
    showImport(options: {
      title: string;
      description: string;
      onImport: (file: File) => void;
      acceptedTypes: string[];
      maxSize: number;
    }) {
      this.openModal('import', options);
    },

    // Export Modal
    showExport(options: {
      title: string;
      description: string;
      onExport: (format: string) => void;
      formats: string[];
    }) {
      this.openModal('export', options);
    },

    // Filter Modal
    showFilter(options: {
      title: string;
      filters: any;
      onApply: (filters: any) => void;
      onReset: () => void;
    }) {
      this.openModal('filter', options);
    },

    // Breadcrumbs
    setBreadcrumbs(breadcrumbs: Array<{ title: string; href?: string }>) {
      this.breadcrumbs = breadcrumbs;
    },

    addBreadcrumb(breadcrumb: { title: string; href?: string }) {
      this.breadcrumbs.push(breadcrumb);
    },

    removeBreadcrumb(index: number) {
      this.breadcrumbs.splice(index, 1);
    },

    clearBreadcrumbs() {
      this.breadcrumbs = [];
    },

    // Initialize UI state
    initializeUI() {
      // Initialize sidebar state
      const sidebarOpen = localStorage.getItem('sidebar_open');
      if (sidebarOpen !== null) {
        this.sidebarOpen = sidebarOpen === 'true';
      }

      // Initialize theme
      const theme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (theme) {
        this.setTheme(theme);
      }

      // Apply theme to document
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Add keyboard shortcuts
      document.addEventListener('keydown', this.handleKeyboardShortcuts);
    },

    // Keyboard shortcuts
    handleKeyboardShortcuts(event: KeyboardEvent) {
      // Ctrl/Cmd + K: Open filter modal
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Implement global search/filter functionality
      }

      // Escape: Close active modal
      if (event.key === 'Escape') {
        const activeModal = this.activeModal;
        if (activeModal) {
          this.closeModal(activeModal as keyof UIState['modals']);
        }
      }

      // Ctrl/Cmd + B: Toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        this.toggleSidebar();
      }

      // Ctrl/Cmd + D: Toggle theme
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        this.toggleTheme();
      }
    },

    // Cleanup
    cleanup() {
      document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    },
  },
});