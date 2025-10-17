<template>
  <Card :class="cardClasses" class="hover:shadow-md transition-shadow duration-200">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="iconBgClass">
              <svg class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ telegrama.id_mesa }}</h3>
            <p class="text-sm text-gray-500">{{ telegrama.provincia?.nombre }}</p>
          </div>
        </div>
        <Badge :variant="statusVariant" size="sm">
          {{ telegrama.estado }}
        </Badge>
      </div>

      <!-- Content -->
      <div class="space-y-3">
        <!-- Location -->
        <div class="flex items-center text-sm text-gray-600">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ telegrama.circuito_escuela }}
        </div>

        <!-- Vote Summary -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded p-2">
            <div class="text-xs text-gray-500">Votos</div>
            <div class="text-lg font-semibold text-gray-900">{{ telegrama.total_votos }}</div>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <div class="text-xs text-gray-500">Participación</div>
            <div class="text-lg font-semibold text-blue-600">{{ participationPercentage }}%</div>
          </div>
        </div>

        <!-- Vote Breakdown -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Blancos:</span>
            <span class="font-medium">{{ telegrama.votos_blanco }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Nulos:</span>
            <span class="font-medium">{{ telegrama.votos_nulos }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Impugnados:</span>
            <span class="font-medium">{{ telegrama.votos_impugnados }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="progressBarClass"
            :style="{ width: participationPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 pt-3 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <div class="text-xs text-gray-500">
            {{ formatDate(telegrama.fecha_carga) }}
          </div>
          <div class="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              @click="$emit('view', telegrama)"
            >
              Ver
            </Button>
            <Button
              v-if="showEditButton"
              variant="outline"
              size="sm"
              @click="$emit('edit', telegrama)"
            >
              Editar
            </Button>
            <Button
              v-if="showValidateButton"
              variant="success"
              size="sm"
              @click="$emit('validate', telegrama)"
            >
              Validar
            </Button>
            <Button
              v-if="showRejectButton"
              variant="danger"
              size="sm"
              @click="$emit('reject', telegrama)"
            >
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '@/lib/api';
import Card from '@/components/ui/Card.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';

interface Props {
  telegrama: Telegrama;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

defineEmits<{
  view: [telegrama: Telegrama];
  edit: [telegrama: Telegrama];
  validate: [telegrama: Telegrama];
  reject: [telegrama: Telegrama];
}>();

// Computed properties
const participationPercentage = computed(() => {
  if (props.telegrama.total_electores === 0) return 0;
  return Math.round((props.telegrama.total_votos / props.telegrama.total_electores) * 100);
});

const statusVariant = computed(() => {
  switch (props.telegrama.estado) {
    case 'validado': return 'success';
    case 'pendiente': return 'warning';
    case 'rechazado': return 'danger';
    default: return 'secondary';
  }
});

const iconBgClass = computed(() => {
  switch (props.telegrama.estado) {
    case 'validado': return 'bg-green-100';
    case 'pendiente': return 'bg-yellow-100';
    case 'rechazado': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
});

const iconClass = computed(() => {
  switch (props.telegrama.estado) {
    case 'validado': return 'text-green-600';
    case 'pendiente': return 'text-yellow-600';
    case 'rechazado': return 'text-red-600';
    default: return 'text-gray-600';
  }
});

const progressBarClass = computed(() => {
  switch (props.telegrama.estado) {
    case 'validado': return 'bg-green-600';
    case 'pendiente': return 'bg-yellow-600';
    case 'rechazado': return 'bg-red-600';
    default: return 'bg-blue-600';
  }
});

const cardClasses = computed(() => {
  if (props.compact) {
    return '';
  }
  
  switch (props.telegrama.estado) {
    case 'validado': return 'border-l-4 border-green-500';
    case 'pendiente': return 'border-l-4 border-yellow-500';
    case 'rechazado': return 'border-l-4 border-red-500';
    default: return 'border-l-4 border-gray-500';
  }
});

const showEditButton = computed(() => {
  return props.telegrama.estado !== 'validado';
});

const showValidateButton = computed(() => {
  return props.telegrama.estado === 'pendiente';
});

const showRejectButton = computed(() => {
  return props.telegrama.estado === 'pendiente';
});
</script>