<template>
  <div class="space-y-4">
    <!-- Validation Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Panel de Validación</h3>
      <Button
        variant="outline"
        size="sm"
        @click="$emit('refresh')"
        :loading="refreshing"
      >
        Actualizar
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500">Validando telegrama...</p>
    </div>

    <!-- Validation Results -->
    <div v-else-if="validationResult" class="space-y-4">
      <!-- Overall Status -->
      <div :class="statusClasses" class="p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <component :is="statusIcon" :class="statusIconClass" class="h-5 w-5" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium" :class="statusTextClass">
              {{ validationResult.valido ? 'Validación Exitosa' : 'Errores Detectados' }}
            </h3>
            <div class="mt-1 text-sm" :class="statusTextClass">
              {{ validationResult.valido 
                ? 'El telegrama cumple con todas las validaciones requeridas.' 
                : 'Se detectaron problemas que deben ser corregidos.' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Details -->
      <div v-if="validationResult.detalles" class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Detalles de Validación</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ validationResult.detalles.total_electores }}</div>
            <div class="text-xs text-gray-500">Electores</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ validationResult.detalles.total_votos }}</div>
            <div class="text-xs text-gray-500">Total Votos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ validationResult.detalles.votos_candidatos }}</div>
            <div class="text-xs text-gray-500">Votos Candidatos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ validationResult.detalles.porcentaje_participacion }}%</div>
            <div class="text-xs text-gray-500">Participación</div>
          </div>
        </div>
      </div>

      <!-- Errors Section -->
      <div v-if="validationResult.errores.length > 0">
        <CollapsibleSection title="Errores Detectados" :count="validationResult.errores.length" :default-open="true">
          <div class="space-y-2">
            <div
              v-for="(error, index) in validationResult.errores"
              :key="index"
              class="flex items-start p-3 bg-red-50 rounded-lg"
            >
              <div class="flex-shrink-0 mt-0.5">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <!-- Warnings Section -->
      <div v-if="validationResult.warnings.length > 0">
        <CollapsibleSection title="Advertencias" :count="validationResult.warnings.length" :default-open="false">
          <div class="space-y-2">
            <div
              v-for="(warning, index) in validationResult.warnings"
              :key="index"
              class="flex items-start p-3 bg-yellow-50 rounded-lg"
            >
              <div class="flex-shrink-0 mt-0.5">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm text-yellow-700">{{ warning }}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <!-- Vote Integrity Check -->
      <div v-if="validationResult.detalles" class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-3">Verificación de Integridad de Votos</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue-700">Suma de votos de candidatos:</span>
            <span class="text-sm font-medium text-blue-900">{{ validationResult.detalles.votos_candidatos }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue-700">Votos especiales (blanco/nulo/impugnados):</span>
            <span class="text-sm font-medium text-blue-900">
              {{ (validationResult.detalles.votos_blanco || 0) + 
                 (validationResult.detalles.votos_nulos || 0) + 
                 (validationResult.detalles.votos_impugnados || 0) }}
            </span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-blue-200">
            <span class="text-sm font-medium text-blue-700">Total calculado:</span>
            <span class="text-sm font-bold text-blue-900">
              {{ (validationResult.detalles.votos_candidatos || 0) + 
                 (validationResult.detalles.votos_blanco || 0) + 
                 (validationResult.detalles.votos_nulos || 0) + 
                 (validationResult.detalles.votos_impugnados || 0) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-blue-700">Total reportado:</span>
            <span class="text-sm font-bold text-blue-900">{{ validationResult.detalles.total_votos }}</span>
          </div>
          <div class="flex items-center mt-2">
            <div class="flex-shrink-0">
              <svg v-if="voteIntegrityValid" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm" :class="voteIntegrityValid ? 'text-green-700' : 'text-red-700'">
                {{ voteIntegrityValid ? 'La suma de votos es correcta' : 'Hay discrepancias en la suma de votos' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          v-if="!validationResult.valido"
          variant="outline"
          @click="$emit('fixErrors')"
        >
          Corregir Errores
        </Button>
        <Button
          v-if="validationResult.valido && showValidateButton"
          variant="success"
          @click="$emit('validate')"
        >
          Validar Telegrama
        </Button>
        <Button
          v-if="!validationResult.valido && showRejectButton"
          variant="danger"
          @click="$emit('reject')"
        >
          Rechazar Telegrama
        </Button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error de Validación</h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error }}
          </div>
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
  validationResult: ValidacionTelegrama | null;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  telegramaEstado?: string;
  showValidateButton?: boolean;
  showRejectButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  refreshing: false,
  error: null,
  telegramaEstado: 'pendiente',
  showValidateButton: true,
  showRejectButton: true,
});

defineEmits<{
  refresh: [];
  validate: [];
  reject: [];
  fixErrors: [];
}>();

// Computed properties
const statusClasses = computed(() => {
  if (!props.validationResult) return '';
  return props.validationResult.valido ? 'bg-green-50' : 'bg-red-50';
});

const statusIcon = computed(() => {
  if (!props.validationResult) return 'svg';
  return props.validationResult.valido 
    ? 'svg' // Success icon
    : 'svg'; // Error icon
});

const statusIconClass = computed(() => {
  if (!props.validationResult) return 'text-gray-400';
  return props.validationResult.valido ? 'text-green-400' : 'text-red-400';
});

const statusTextClass = computed(() => {
  if (!props.validationResult) return 'text-gray-700';
  return props.validationResult.valido ? 'text-green-700' : 'text-red-700';
});

const voteIntegrityValid = computed(() => {
  if (!props.validationResult?.detalles) return false;
  
  const { total_votos, votos_candidatos, votos_blanco = 0, votos_nulos = 0, votos_impugnados = 0 } = props.validationResult.detalles;
  
  const calculatedTotal = (votos_candidatos || 0) + votos_blanco + votos_nulos + votos_impugnados;
  
  return calculatedTotal === total_votos;
});
</script>

<!-- Collapsible Section Component (nested) -->
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