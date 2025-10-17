import { defineStore } from 'pinia';
import { api } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  filters: {
    read?: boolean;
    type?: 'success' | 'error' | 'warning' | 'info' | 'system';
    date_from?: string;
    date_to?: string;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system';
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    url?: string;
    method?: 'get' | 'post' | 'put' | 'delete';
    data?: any;
  }>;
}

export const useNotificacionesStore = defineStore('notificaciones', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: null,
    filters: {},
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read_at);
    },
    
    readNotifications: (state) => {
      return state.notifications.filter(n => !!n.read_at);
    },
    
    notificationsByType: (state) => (type: Notification['type']) => {
      return state.notifications.filter(n => n.type === type);
    },
    
    recentNotifications: (state) => {
      return state.notifications
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    },
    
    hasUnreadNotifications: (state) => state.unreadCount > 0,
    
    notificationCount: (state) => state.notifications.length,
  },

  actions: {
    async fetchNotifications(page = 1, filters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        // Build query string manually
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('per_page', '20');
        
        // Add filters
        Object.entries({ ...filters, ...this.filters }).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        const response = await api.get(`/api/v1/notificaciones?${queryParams.toString()}`) as {
          data: {
            data: Notification[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
          };
        };
        
        if (page === 1) {
          this.notifications = response.data.data;
        } else {
          this.notifications.push(...response.data.data);
        }
        
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        };
        
        this.updateUnreadCount();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error loading notifications';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(notificationId: string) {
      try {
        await api.post(`/api/v1/notificaciones/${notificationId}/read`, {});
        
        // Update notification in store
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read_at = new Date().toISOString();
        }
        
        this.updateUnreadCount();
      } catch (error: any) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },

    async markAllAsRead() {
      try {
        await api.post('/api/v1/notificaciones/read-all', {});
        
        // Update all notifications in store
        this.notifications.forEach(notification => {
          if (!notification.read_at) {
            notification.read_at = new Date().toISOString();
          }
        });
        
        this.unreadCount = 0;
      } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },

    async deleteNotification(notificationId: string) {
      try {
        await api.delete(`/api/v1/notificaciones/${notificationId}`);
        
        // Remove notification from store
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
        
        this.updateUnreadCount();
      } catch (error: any) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    },

    async clearReadNotifications() {
      try {
        await api.delete('/api/v1/notificaciones/clear-read');
        
        // Remove read notifications from store
        this.notifications = this.notifications.filter(n => !n.read_at);
        this.pagination = null;
      } catch (error: any) {
        console.error('Error clearing read notifications:', error);
        throw error;
      }
    },

    async createNotification(notificationData: {
      type: 'success' | 'error' | 'warning' | 'info' | 'system';
      title: string;
      message: string;
      data?: any;
      persistent?: boolean;
      expires_at?: string;
    }) {
      try {
        const response = await api.post('/api/v1/notificaciones', notificationData) as {
          data: Notification;
        };
        
        // Add notification to the beginning of the list
        this.notifications.unshift(response.data);
        this.unreadCount++;
        
        return response.data;
      } catch (error: any) {
        console.error('Error creating notification:', error);
        throw error;
      }
    },

    setFilters(filters: Partial<NotificationState['filters']>) {
      this.filters = { ...this.filters, ...filters };
      this.fetchNotifications(1);
    },

    clearFilters() {
      this.filters = {};
      this.fetchNotifications(1);
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read_at).length;
    },

    // Real-time notification handling
    handleRealtimeNotification(notification: Notification) {
      // Add notification to the beginning of the list
      this.notifications.unshift(notification);
      
      // Update unread count
      this.unreadCount++;
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    },

    // Request notification permission
    async requestNotificationPermission() {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    },

    // Initialize store
    async initialize() {
      try {
        // Request notification permission
        await this.requestNotificationPermission();
        
        // Fetch initial notifications
        await this.fetchNotifications();
        
        // Set up real-time notifications (if using WebSocket)
        this.setupRealtimeNotifications();
      } catch (error) {
        console.error('Error initializing notifications store:', error);
      }
    },

    // Setup real-time notifications
    setupRealtimeNotifications() {
      // This would typically be implemented with WebSocket
      // For now, we'll leave it as a placeholder
      console.log('Real-time notifications setup would go here');
    },

    // Cleanup expired notifications
    cleanupExpiredNotifications() {
      const now = new Date();
      this.notifications = this.notifications.filter(notification => {
        if (!notification.expires_at) return true;
        return new Date(notification.expires_at) > now;
      });
      
      this.updateUnreadCount();
    },

    // Process notification action
    async processNotificationAction(notificationId: string, actionIndex: number) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (!notification || !notification.actions || !notification.actions[actionIndex]) {
        return;
      }
      
      const action = notification.actions[actionIndex];
      
      try {
        if (action.url) {
          // Make API request
          const options: any = {};
          
          if (action.method && action.method !== 'get') {
            options.method = action.method;
          }
          
          if (action.data) {
            options.data = action.data;
          }
          
          await api[action.method || 'get'](action.url, options.data || {});
        }
        
        // Mark notification as read after action
        await this.markAsRead(notificationId);
      } catch (error: any) {
        console.error('Error processing notification action:', error);
        throw error;
      }
    },

    // Refresh notifications
    async refresh() {
      this.pagination = null;
      await this.fetchNotifications(1);
    },

    // Load more notifications (pagination)
    async loadMore() {
      if (!this.pagination || this.pagination.current_page >= this.pagination.last_page) {
        return;
      }
      
      await this.fetchNotifications(this.pagination.current_page + 1);
    },

    // Search notifications
    searchNotifications(query: string) {
      if (!query.trim()) {
        return this.notifications;
      }
      
      const lowerQuery = query.toLowerCase();
      return this.notifications.filter(notification =>
        notification.title.toLowerCase().includes(lowerQuery) ||
        notification.message.toLowerCase().includes(lowerQuery)
      );
    },

    // Get notification statistics
    getNotificationStats() {
      const stats = {
        total: this.notifications.length,
        unread: this.unreadCount,
        read: this.notifications.length - this.unreadCount,
        byType: {} as Record<string, number>,
      };
      
      this.notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      });
      
      return stats;
    },
  },
});