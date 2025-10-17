<template>
  <div class="relative">
    <!-- Notification button -->
    <button
      type="button"
      class="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      @click="toggleDropdown"
    >
      <span class="sr-only">Ver notificaciones</span>
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      <!-- Unread count badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
        @click.stop
      >
        <!-- Header -->
        <div class="px-4 py-3 flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">Notificaciones</h3>
          <div class="flex space-x-2">
            <button
              v-if="unreadCount > 0"
              type="button"
              class="text-xs text-blue-600 hover:text-blue-500"
              @click="markAllAsRead"
            >
              Marcar todas como leídas
            </button>
            <button
              type="button"
              class="text-xs text-gray-500 hover:text-gray-700"
              @click="clearAllNotifications"
            >
              Limpiar
            </button>
          </div>
        </div>

        <!-- Notifications list -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading state -->
          <div v-if="loading" class="px-4 py-8 text-center">
            <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Cargando notificaciones...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">No tienes notificaciones</p>
          </div>

          <!-- Notification items -->
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="[
                'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                !notification.read_at ? 'bg-blue-50' : ''
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <component :is="getIcon(notification.type)" :class="iconClasses(notification.type)" class="h-5 w-5" />
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatTime(notification.created_at) }}
                  </p>
                </div>
                <div class="ml-2 flex-shrink-0">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-500"
                    @click.stop="removeNotification(notification.id)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="px-4 py-3 bg-gray-50 flex justify-between">
          <button
            type="button"
            class="text-sm text-blue-600 hover:text-blue-500"
            @click="loadMore"
            :disabled="!hasMore"
          >
            Cargar más
          </button>
          <router-link
            to="/notificaciones"
            class="text-sm text-blue-600 hover:text-blue-500"
            @click="closeDropdown"
          >
            Ver todas
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificacionesStore } from '@/stores/notificaciones';
import { useRouter } from 'vue-router';
import type { Notification } from '@/stores/notificaciones';

const notificacionesStore = useNotificacionesStore();
const router = useRouter();

// State
const isOpen = ref(false);
const hasMore = ref(false);
const loading = ref(false);

// Computed
const notifications = computed(() => {
  return notificacionesStore.recentNotifications;
});

const unreadCount = computed(() => {
  return notificacionesStore.unreadCount;
});

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  
  if (isOpen.value) {
    loadNotifications();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const loadNotifications = async () => {
  if (notifications.value.length === 0) {
    loading.value = true;
    
    try {
      await notificacionesStore.fetchNotifications();
      hasMore.value = notificacionesStore.pagination ? 
        notificacionesStore.pagination.current_page < notificacionesStore.pagination.last_page : 
        false;
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      loading.value = false;
    }
  }
};

const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  
  loading.value = true;
  
  try {
    const currentPage = notificacionesStore.pagination?.current_page || 1;
    await notificacionesStore.loadMore();
    hasMore.value = notificacionesStore.pagination ? 
      notificacionesStore.pagination.current_page < notificacionesStore.pagination.last_page : 
      false;
  } catch (error) {
    console.error('Error loading more notifications:', error);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read if unread
  if (!notification.read_at) {
    try {
      await notificacionesStore.markAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
  
  // Navigate to related page if available
  // This would depend on the notification data structure
  closeDropdown();
};

const removeNotification = async (id: string) => {
  try {
    await notificacionesStore.deleteNotification(id);
  } catch (error) {
    console.error('Error removing notification:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await notificacionesStore.markAllAsRead();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

const clearAllNotifications = () => {
  notificacionesStore.clearNotifications();
  closeDropdown();
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Ahora';
  } else if (diffInSeconds < 3600) {
    return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  } else if (diffInSeconds < 86400) {
    return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  } else {
    return date.toLocaleDateString();
  }
};

// Icon components
const CheckIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `,
};

const ExclamationIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  `,
};

const XCircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `,
};

const InformationCircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `,
};

const BellIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  `,
};

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success': return CheckIcon;
    case 'error': return XCircleIcon;
    case 'warning': return ExclamationIcon;
    case 'info': return InformationCircleIcon;
    case 'system': return BellIcon;
    default: return InformationCircleIcon;
  }
};

const iconClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    case 'system': return 'text-gray-400';
    default: return 'text-blue-400';
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element;
  if (!target.closest('.relative')) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>