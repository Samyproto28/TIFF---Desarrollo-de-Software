<template>
  <div class="border border-gray-200 rounded-lg">
    <button
      type="button"
      class="w-full px-4 py-3 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-t-lg"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-900">{{ title }}</span>
        <div class="flex items-center space-x-2">
          <span v-if="count !== undefined" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {{ count }}
          </span>
          <svg
            :class="[isOpen ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform transition-transform duration-200']"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>
    <div v-show="isOpen" class="border-t border-gray-200">
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  count?: number;
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
});

const isOpen = ref(props.defaultOpen);
</script>