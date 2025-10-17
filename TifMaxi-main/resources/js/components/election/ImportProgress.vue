<template>
  <div class="space-y-4">
    <!-- Progress Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Progreso de Importación</h3>
      <Button
        v-if="showCancelButton && !completed"
        variant="outline"
        size="sm"
        @click="$emit('cancel')"
        :disabled="cancelling"
      >
        {{ cancelling ? 'Cancelando...' : 'Cancelar' }}
      </Button>
    </div>

    <!-- Progress Bar -->
    <div>
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>{{ progressText }}</span>
        <span>{{ Math.round(progressPercentage) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-300"
          :class="progressBarClass"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- Current Status -->
    <div class="flex items-center space-x-3">
      <LoadingSpinner v-if="!completed" />
      <div v-else class="flex-shrink-0">
        <svg v-if="successful" class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">{{ statusText }}</p>
        <p v-if="detailText" class="text-sm text-gray-500">{{ detailText }}</p>
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="showStats && (processedCount > 0 || errorCount > 0)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gray-50 p-3 rounded">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalCount }}</div>
          <div class="text-xs text-gray-500">Total</div>
        </div>
      </div>
      <div class="bg-green-50 p-3 rounded">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ processedCount }}</div>
          <div class="text-xs text-gray-500">Procesados</div>
        </div>
      </div>
      <div class="bg-red-50 p-3 rounded">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ errorCount }}</div>
          <div class="text-xs text-gray-500">Errores</div>
        </div>
      </div>
    </div>

    <!-- Error Details -->
    <div v-if="errors.length > 0">
      <CollapsibleSection title="Detalles de Errores" :count="errors.length" :default-open="false">
        <div class="max-h-48 overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fila
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(error, index) in errors" :key="index">
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ error.row || index + 1 }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {{ error.id || '-' }}
                </td>
                <td class="px-3 py-2 text-sm text-red-600">
                  {{ error.message }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </div>

    <!-- Completed State -->
    <div v-if="completed" class="pt-4 border-t border-gray-200">
      <div class="flex justify-between">
        <div class="text-sm text-gray-500">
          Importación {{ successful ? 'completada exitosamente' : 'completada con errores' }}
        </div>
        <div class="space-x-3">
          <Button
            v-if="showRetryButton && !successful"
            variant="outline"
            @click="$emit('retry')"
          >
            Reintentar
          </Button>
          <Button
            variant="primary"
            @click="$emit('finish')"
          >
            {{ successful ? 'Ver Resultados' : 'Continuar' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import Button from '@/components/ui/Button.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';

interface Props {
  current: number;
  total: number;
  status: string;
  detailText?: string;
  errorCount?: number;
  errors?: Array<{
    row?: number;
    id?: string;
    message: string;
  }>;
  completed?: boolean;
  successful?: boolean;
  cancelling?: boolean;
  showStats?: boolean;
  showCancelButton?: boolean;
  showRetryButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  errorCount: 0,
  errors: () => [],
  completed: false,
  successful: true,
  cancelling: false,
  showStats: true,
  showCancelButton: true,
  showRetryButton: true,
});

defineEmits<{
  cancel: [];
  retry: [];
  finish: [];
}>();

// Computed properties
const progressPercentage = computed(() => {
  if (props.total === 0) return 0;
  return (props.current / props.total) * 100;
});

const progressText = computed(() => {
  return `Procesando ${props.current} de ${props.total} registros`;
});

const statusText = computed(() => {
  if (props.completed) {
    return props.successful ? 'Importación completada' : 'Importación completada con errores';
  }
  return props.status;
});

const processedCount = computed(() => {
  return props.current - props.errorCount;
});

const totalCount = computed(() => {
  return props.current;
});

const progressBarClass = computed(() => {
  if (props.completed) {
    return props.successful ? 'bg-green-600' : 'bg-red-600';
  }
  return 'bg-blue-600';
});
</script>