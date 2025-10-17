<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Detalles del Telegrama</h1>
            <p class="mt-2 text-gray-600">Información completa y validación</p>
          </div>
          <div class="flex space-x-3">
            <Button variant="outline" @click="navigate.to('/telegramas')">
              Volver
            </Button>
            <Button
              v-if="telegrama.estado === 'pendiente'"
              variant="outline"
              @click="navigate.to(`/telegramas/${telegrama.id}/edit`)"
            >
              Editar
            </Button>
            <Button
              v-if="telegrama.estado === 'pendiente'"
              variant="success"
              @click="validateTelegrama"
              :loading="validating"
            >
              Validar
            </Button>
            <Button
              v-if="telegrama.estado === 'pendiente'"
              variant="danger"
              @click="showRejectModal = true"
            >
              Rechazar
            </Button>
          </div>
        </div>

        <!-- Status Alert -->
        <div class="mb-6">
          <div :class="getStatusClass(telegrama.estado)">
            <div class="flex">
              <div class="flex-shrink-0">
                <component :is="getStatusIcon(telegrama.estado)" class="h-5 w-5" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium" :class="getStatusTextClass(telegrama.estado)">
                  Estado: <strong>{{ telegrama.estado.toUpperCase() }}</strong>
                  <span v-if="telegrama.estado === 'validado'"> - {{ formatDate(telegrama.fecha_validacion) }}</span>
                </p>
                <p v-if="telegrama.motivo_rechazo" class="text-sm mt-1" :class="getStatusTextClass(telegrama.estado)">
                  Motivo: {{ telegrama.motivo_rechazo }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- General Information -->
          <Card class="lg:col-span-2">
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Información General</h3>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">ID Mesa</dt>
                <dd class="text-sm text-gray-900 font-mono">{{ telegrama.id_mesa }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Provincia</dt>
                <dd class="text-sm text-gray-900">{{ telegrama.provincia?.nombre }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Circuito/Escuela</dt>
                <dd class="text-sm text-gray-900">{{ telegrama.circuito_escuela }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de Carga</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(telegrama.fecha_carga) }}</dd>
              </div>
            </div>
          </Card>

          <!-- Vote Summary -->
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Resumen de Votos</h3>
            </template>
            
            <div class="space-y-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ telegrama.total_votos }}</div>
                <div class="text-sm text-gray-500">Total Votos</div>
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Participación:</span>
                  <span class="font-medium">{{ calculateParticipation() }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    :style="{ width: calculateParticipation() + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Blancos:</span>
                  <span class="font-medium">{{ telegrama.votos_blanco }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Nulos:</span>
                  <span class="font-medium">{{ telegrama.votos_nulos }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Impugnados:</span>
                  <span class="font-medium">{{ telegrama.votos_impugnados }}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Validation Panel -->
        <Card class="mb-8">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Panel de Validación</h3>
              <Button
                variant="outline"
                size="sm"
                @click="refreshValidation"
                :loading="refreshingValidation"
              >
                Actualizar Validación
              </Button>
            </div>
          </template>
          
          <div v-if="loadingValidation" class="text-center py-8">
            <LoadingSpinner />
            <p class="mt-2 text-gray-500">Validando telegrama...</p>
          </div>
          
          <div v-else-if="validationResult" class="space-y-6">
            <!-- Validation Status -->
            <div :class="validationResult.valido ? 'bg-green-50' : 'bg-red-50'" class="p-4 rounded">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg v-if="validationResult.valido" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium" :class="validationResult.valido ? 'text-green-800' : 'text-red-800'">
                    {{ validationResult.valido ? 'Validación Exitosa' : 'Errores Detectados' }}
                  </h3>
                  <div class="mt-2 text-sm" :class="validationResult.valido ? 'text-green-700' : 'text-red-700'">
                    {{ validationResult.valido ? 'El telegrama cumple con todas las validaciones requeridas.' : 'Se detectaron los siguientes problemas que deben ser corregidos.' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Validation Details -->
            <div v-if="validationResult.detalles" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">ID Mesa</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.id_mesa }}</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">Provincia</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.provincia }}</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">Total Electores</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.total_electores }}</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">Total Votos</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.total_votos }}</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">Votos Candidatos</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.votos_candidatos }}</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded">
                <dt class="text-sm font-medium text-gray-500">Participación</dt>
                <dd class="text-sm text-gray-900">{{ validationResult.detalles.porcentaje_participacion }}%</dd>
              </div>
            </div>

            <!-- Errors -->
            <div v-if="validationResult.errores.length > 0">
              <h4 class="text-md font-medium text-red-800 mb-3">Errores:</h4>
              <ul class="space-y-2">
                <li v-for="(error, index) in validationResult.errores" :key="index" class="flex items-start">
                  <svg class="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-red-700">{{ error }}</span>
                </li>
              </ul>
            </div>

            <!-- Warnings -->
            <div v-if="validationResult.warnings.length > 0">
              <h4 class="text-md font-medium text-yellow-800 mb-3">Advertencias:</h4>
              <ul class="space-y-2">
                <li v-for="(warning, index) in validationResult.warnings" :key="index" class="flex items-start">
                  <svg class="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-yellow-700">{{ warning }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Candidate Votes -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">Votos por Candidato</h3>
          </template>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidato
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votos
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="candidato in telegrama.candidatos" :key="candidato.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ candidato.nombre_completo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'" size="sm">
                      {{ candidato.cargo }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ candidato.pivot.votos }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ calculateCandidatePercentage(candidato.pivot.votos) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- Reject Modal -->
        <Modal
          :show="showRejectModal"
          title="Rechazar Telegrama"
          @close="showRejectModal = false"
        >
          <div class="space-y-4">
            <div>
              <label for="motivo_rechazo" class="block text-sm font-medium text-gray-700">
                Motivo de rechazo *
              </label>
              <textarea
                id="motivo_rechazo"
                v-model="motivoRechazo"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describa el motivo del rechazo..."
              ></textarea>
            </div>
          </div>

          <template #footer>
            <Button
              variant="outline"
              @click="showRejectModal = false"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              :loading="rejecting"
              @click="rejectTelegrama"
            >
              Rechazar
            </Button>
          </template>
        </Modal>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import { navigate, formatDate } from '@/lib/api';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

interface Props {
  telegrama: Telegrama;
  validacion: ValidacionTelegrama;
}

const props = defineProps<Props>();

// State
const validating = ref(false);
const rejecting = ref(false);
const refreshingValidation = ref(false);
const loadingValidation = ref(false);
const showRejectModal = ref(false);
const motivoRechazo = ref('');
const validationResult = ref<ValidacionTelegrama | null>(props.validacion);

// Methods
const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'validado':
      return 'bg-green-50 border-l-4 border-green-400 p-4';
    case 'pendiente':
      return 'bg-yellow-50 border-l-4 border-yellow-400 p-4';
    case 'rechazado':
      return 'bg-red-50 border-l-4 border-red-400 p-4';
    default:
      return 'bg-gray-50 border-l-4 border-gray-400 p-4';
  }
};

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'validado':
      return 'svg'; // Success icon
    case 'pendiente':
      return 'svg'; // Warning icon
    case 'rechazado':
      return 'svg'; // Error icon
    default:
      return 'svg'; // Default icon
  }
};

const getStatusTextClass = (estado: string) => {
  switch (estado) {
    case 'validado':
      return 'text-green-700';
    case 'pendiente':
      return 'text-yellow-700';
    case 'rechazado':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
};

const calculateParticipation = () => {
  if (props.telegrama.total_electores === 0) return '0.0';
  return ((props.telegrama.total_votos / props.telegrama.total_electores) * 100).toFixed(1);
};

const calculateCandidatePercentage = (votes: number) => {
  if (props.telegrama.total_votos === 0) return '0.0';
  return ((votes / props.telegrama.total_votos) * 100).toFixed(1);
};

const validateTelegrama = () => {
  validating.value = true;
  
  router.post(`/telegramas/${props.telegrama.id}/validar`, {}, {
    onFinish: () => {
      validating.value = false;
      refreshValidation();
    },
  });
};

const rejectTelegrama = () => {
  if (!motivoRechazo.value.trim()) return;
  
  rejecting.value = true;
  
  router.post(`/telegramas/${props.telegrama.id}/rechazar`, {
    motivo_rechazo: motivoRechazo.value,
  }, {
    onSuccess: () => {
      showRejectModal.value = false;
      motivoRechazo.value = '';
      refreshValidation();
    },
    onFinish: () => {
      rejecting.value = false;
    },
  });
};

const refreshValidation = () => {
  refreshingValidation.value = true;
  
  api.get(`/api/v1/telegramas/${props.telegrama.id}/validar`)
    .then((response) => {
      validationResult.value = response.data;
    })
    .catch((error) => {
      console.error('Error refreshing validation:', error);
    })
    .finally(() => {
      refreshingValidation.value = false;
    });
};

// Initialize
onMounted(() => {
  if (!props.validacion) {
    refreshValidation();
  }
});
</script>