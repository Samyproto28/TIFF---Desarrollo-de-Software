<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="notificationClasses(notification)"
        class="p-4 rounded-lg shadow-lg border"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <component :is="getIcon(notification.type)" :class="iconClasses(notification.type)" class="h-5 w-5" />
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium" :class="titleClasses(notification.type)">
              {{ notification.title }}
            </h3>
            <div class="mt-1 text-sm" :class="messageClasses(notification.type)">
              {{ notification.message }}
            </div>
            <div v-if="notification.actions && notification.actions.length > 0" class="mt-3 flex space-x-2">
              <button
                v-for="(action, index) in notification.actions"
                :key="index"
                type="button"
                :class="actionButtonClasses(action.variant)"
                @click="handleAction(notification, index)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              :class="closeButtonClasses(notification.type)"
              @click="removeNotification(notification.id)"
            >
              <span class="sr-only">Cerrar</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import type { Notification } from '@/stores/ui';

const uiStore = useUIStore();

// Use only the first 5 notifications to avoid cluttering the UI
const notifications = computed(() => uiStore.notifications.slice(0, 5));

// Methods
const removeNotification = (id: string) => {
  uiStore.removeNotification(id);
};

const handleAction = (notification: Notification, actionIndex: number) => {
  if (notification.actions && notification.actions[actionIndex]) {
    notification.actions[actionIndex].action();
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

// Style classes
const notificationClasses = (notification: Notification) => {
  switch (notification.type) {
    case 'success': return 'bg-green-50 border-green-200';
    case 'error': return 'bg-red-50 border-red-200';
    case 'warning': return 'bg-yellow-50 border-yellow-200';
    case 'info': return 'bg-blue-50 border-blue-200';
    case 'system': return 'bg-gray-50 border-gray-200';
    default: return 'bg-blue-50 border-blue-200';
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

const titleClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-800';
    case 'error': return 'text-red-800';
    case 'warning': return 'text-yellow-800';
    case 'info': return 'text-blue-800';
    case 'system': return 'text-gray-800';
    default: return 'text-blue-800';
  }
};

const messageClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-700';
    case 'error': return 'text-red-700';
    case 'warning': return 'text-yellow-700';
    case 'info': return 'text-blue-700';
    case 'system': return 'text-gray-700';
    default: return 'text-blue-700';
  }
};

const closeButtonClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-400 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
    case 'error': return 'text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
    case 'warning': return 'text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500';
    case 'info': return 'text-blue-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    case 'system': return 'text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500';
    default: return 'text-blue-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  }
};

const actionButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
  return variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded px-2.5 py-1.5'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded px-2.5 py-1.5';
};
</script>

<style scoped>
/* Notification transitions */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>