<template>
  <div :class="containerClass" class="flex items-center justify-center">
    <div :class="spinnerClass" class="animate-spin rounded-full border-2 border-gray-300">
      <div class="rounded-full border-2 border-transparent" :style="innerStyle"></div>
    </div>
    <p v-if="text" class="ml-2 text-sm" :class="textClass">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  text?: string;
  inline?: boolean;
  overlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  inline: false,
  overlay: false,
});

// Computed
const sizeClasses = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const colorClasses = {
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  success: 'border-green-600',
  danger: 'border-red-600',
  warning: 'border-yellow-600',
  info: 'border-indigo-600',
};

const innerColorClasses = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  danger: 'bg-red-600',
  warning: 'bg-yellow-600',
  info: 'bg-indigo-600',
};

const textClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-indigo-600',
};

const spinnerClass = computed(() => {
  return `${sizeClasses[props.size]} ${colorClasses[props.color]}`;
});

const innerStyle = computed(() => {
  return {
    borderTopColor: innerColorClasses[props.color],
    width: sizeClasses[props.size],
    height: sizeClasses[props.size],
  };
});

const textClass = computed(() => {
  return textClasses[props.color];
});

const containerClass = computed(() => {
  if (props.overlay) {
    return 'fixed inset-0 bg-white bg-opacity-75 z-50';
  }
  
  if (props.inline) {
    return 'inline-flex';
  }
  
  return '';
});
</script>
