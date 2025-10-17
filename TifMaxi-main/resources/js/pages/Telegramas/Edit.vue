<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Editar Telegrama</h1>
          <p class="mt-2 text-gray-600">Modifique los datos del telegrama electoral</p>
        </div>

        <!-- Status Alert -->
        <div v-if="telegrama.estado !== 'pendiente'" class="mb-6">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  Este telegrama está <strong>{{ telegrama.estado }}</strong>. 
                  <span v-if="telegrama.estado === 'validado'">Algunos campos están bloqueados para mantener la integridad de los datos.</span>
                  <span v-if="telegrama.estado === 'rechazado'">Puede modificar los datos y solicitar una nueva validación.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <Card>
          <form @submit.prevent="submit">
            <div class="space-y-6">
              <!-- ID Mesa -->
              <div>
                <label for="id_mesa" class="block text-sm font-medium text-gray-700">
                  ID de Mesa *
                </label>
                <Input
                  id="id_mesa"
                  v-model="form.id_mesa"
                  type="text"
                  :disabled="telegrama.estado === 'validado'"
                  :error="form.getError('id_mesa')"
                  @blur="validateField('id_mesa')"
                />
                <p v-if="telegrama.estado === 'validado'" class="mt-1 text-sm text-gray-500">
                  El ID de mesa no se puede modificar en telegramas validados
                </p>
              </div>

              <!-- Provincia -->
              <div>
                <label for="provincia_id" class="block text-sm font-medium text-gray-700">
                  Provincia *
                </label>
                <Select
                  id="provincia_id"
                  v-model="form.provincia_id"
                  :options="provinciaOptions"
                  :disabled="telegrama.estado === 'validado'"
                  :error="form.getError('provincia_id')"
                  @change="handleProvinciaChange"
                />
                <p v-if="telegrama.estado === 'validado'" class="mt-1 text-sm text-gray-500">
                  La provincia no se puede modificar en telegramas validados
                </p>
              </div>

              <!-- Circuito/Escuela -->
              <div>
                <label for="circuito_escuela" class="block text-sm font-medium text-gray-700">
                  Circuito / Escuela *
                </label>
                <Input
                  id="circuito_escuela"
                  v-model="form.circuito_escuela"
                  type="text"
                  :disabled="telegrama.estado === 'validado'"
                  :error="form.getError('circuito_escuela')"
                  @blur="validateField('circuito_escuela')"
                />
              </div>

              <!-- Total Electores -->
              <div>
                <label for="total_electores" class="block text-sm font-medium text-gray-700">
                  Total de Electores *
                </label>
                <Input
                  id="total_electores"
                  v-model.number="form.total_electores"
                  type="number"
                  min="0"
                  :disabled="telegrama.estado === 'validado'"
                  :error="form.getError('total_electores')"
                  @blur="validateField('total_electores')"
                  @input="calculateParticipation"
                />
              </div>

              <!-- Vote Totals -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="total_votos" class="block text-sm font-medium text-gray-700">
                    Total Votos *
                  </label>
                  <Input
                    id="total_votos"
                    v-model.number="form.total_votos"
                    type="number"
                    min="0"
                    :disabled="telegrama.estado === 'validado'"
                    :error="form.getError('total_votos')"
                    @blur="validateField('total_votos')"
                    @input="validateVoteTotals"
                  />
                </div>

                <div>
                  <label for="votos_blanco" class="block text-sm font-medium text-gray-700">
                    Votos en Blanco
                  </label>
                  <Input
                    id="votos_blanco"
                    v-model.number="form.votos_blanco"
                    type="number"
                    min="0"
                    :disabled="telegrama.estado === 'validado'"
                    @input="validateVoteTotals"
                  />
                </div>

                <div>
                  <label for="votos_nulos" class="block text-sm font-medium text-gray-700">
                    Votos Nulos
                  </label>
                  <Input
                    id="votos_nulos"
                    v-model.number="form.votos_nulos"
                    type="number"
                    min="0"
                    :disabled="telegrama.estado === 'validado'"
                    @input="validateVoteTotals"
                  />
                </div>

                <div>
                  <label for="votos_impugnados" class="block text-sm font-medium text-gray-700">
                    Votos Impugnados
                  </label>
                  <Input
                    id="votos_impugnados"
                    v-model.number="form.votos_impugnados"
                    type="number"
                    min="0"
                    :disabled="telegrama.estado === 'validado'"
                    @input="validateVoteTotals"
                  />
                </div>
              </div>

              <!-- Candidate Votes -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Votos por Candidato</h3>
                <div v-if="candidatosDeProvincia.length === 0" class="text-center py-8">
                  <p class="text-gray-500">No hay candidatos disponibles para la provincia seleccionada</p>
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="candidato in candidatosDeProvincia"
                    :key="candidato.id"
                    class="flex items-center space-x-4"
                  >
                    <div class="flex-1">
                      <label :for="`candidato_${candidato.id}`" class="block text-sm font-medium text-gray-700">
                        {{ candidato.nombre_completo }}
                        <Badge :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'" class="ml-2">
                          {{ candidato.cargo }}
                        </Badge>
                      </label>
                      <Input
                        :id="`candidato_${candidato.id}`"
                        v-model.number="form.candidatos[candidato.id]"
                        type="number"
                        min="0"
                        :disabled="telegrama.estado === 'validado'"
                        @input="validateVoteTotals"
                      />
                    </div>
                    <div class="text-sm text-gray-500 min-w-[60px] text-right">
                      {{ calculateCandidatePercentage(candidato.id) }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Validation Messages -->
              <div v-if="validationMessage" :class="validationClass">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error de validación</h3>
                    <div class="mt-2 text-sm text-red-700">
                      {{ validationMessage }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Success Messages -->
              <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-green-800">Validación correcta</h3>
                    <div class="mt-2 text-sm text-green-700">
                      {{ successMessage }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Motivo de Rechazo (si está rechazado) -->
              <div v-if="telegrama.estado === 'rechazado' && telegrama.motivo_rechazo">
                <div class="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 class="text-sm font-medium text-red-800 mb-2">Motivo de Rechazo anterior:</h4>
                  <p class="text-sm text-red-700">{{ telegrama.motivo_rechazo }}</p>
                </div>
              </div>

              <!-- Historial de cambios -->
              <div v-if="changeHistory.length > 0">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Historial de Cambios</h3>
                <div class="space-y-3">
                  <div
                    v-for="change in changeHistory"
                    :key="change.id"
                    class="flex items-start space-x-3 p-3 bg-gray-50 rounded"
                  >
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm text-gray-900">
                        <span class="font-medium">{{ change.user }}</span> 
                        {{ change.action }}
                        <span v-if="change.field" class="font-medium">"{{ change.field }}"</span>
                      </p>
                      <p class="text-xs text-gray-500">{{ formatDate(change.timestamp) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-end space-x-3">
              <Button variant="outline" @click="navigate.to('/telegramas')">
                Cancelar
              </Button>
              <Button
                v-if="telegrama.estado === 'rechazado'"
                variant="outline"
                @click="requestRevalidation"
                :disabled="!!validationMessage"
              >
                Solicitar Revalidación
              </Button>
              <Button
                type="submit"
                variant="primary"
                :loading="form.processing"
                :disabled="!!validationMessage || telegrama.estado === 'validado'"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useForm } from '@/composables/useForm';
import { navigate, formatDate } from '@/lib/api';
import { rules } from '@/composables/useForm';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Badge from '@/components/ui/Badge.vue';

interface Props {
  telegrama: Telegrama;
  provincias: Provincia[];
  candidatos: Candidato[];
}

const props = defineProps<Props>();

// Form setup - initialize with telegrama data
const initialForm = {
  id_mesa: props.telegrama.id_mesa,
  provincia_id: props.telegrama.provincia_id,
  circuito_escuela: props.telegrama.circuito_escuela,
  total_electores: props.telegrama.total_electores,
  total_votos: props.telegrama.total_votos,
  votos_blanco: props.telegrama.votos_blanco,
  votos_nulos: props.telegrama.votos_nulos,
  votos_impugnados: props.telegrama.votos_impugnados,
  candidatos: {} as Record<number, number>,
};

// Initialize candidate votes
if (props.telegrama.candidatos) {
  props.telegrama.candidatos.forEach((candidato: any) => {
    initialForm.candidatos[candidato.id] = candidato.pivot.votos;
  });
}

const form = useForm(initialForm, {
  resetOnSuccess: false,
});

// Change history (mock data for now)
const changeHistory = ref([
  {
    id: 1,
    user: 'Juan Pérez',
    action: 'creó el telegrama',
    field: null,
    timestamp: props.telegrama.created_at,
  },
  // Add more change history as needed
]);

// Computed properties
const selectedProvincia = computed(() =>
  props.provincias.find(p => p.id === form.data.provincia_id)
);

const candidatosDeProvincia = computed(() =>
  props.candidatos.filter(c => c.provincia_id === form.data.provincia_id)
);

const totalCandidatoVotes = computed(() =>
  Object.values(form.data.candidatos).reduce((sum, votes) => sum + votes, 0)
);

const validationMessage = computed(() => {
  const total = totalCandidatoVotes.value + 
                form.data.votos_blanco + 
                form.data.votos_nulos + 
                form.data.votos_impugnados;
  
  if (total !== form.data.total_votos) {
    const difference = Math.abs(total - form.data.total_votos);
    return `La suma de votos (${total}) no coincide con el total (${form.data.total_votos}). Diferencia: ${difference}`;
  }
  
  return null;
});

const successMessage = computed(() => {
  if (form.data.total_votos > 0 && !validationMessage.value) {
    return 'La suma de votos es correcta.';
  }
  return null;
});

const validationClass = computed(() => ({
  'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded': validationMessage.value,
}));

// Options
const provinciaOptions = computed(() =>
  props.provincias.map(p => ({ value: p.id, label: p.nombre }))
);

// Methods
const handleProvinciaChange = async () => {
  // Load candidates for selected province
  if (form.data.provincia_id) {
    try {
      const response = await api.get(`/api/v1/provincias/${form.data.provincia_id}/candidatos`);
      response.data.forEach((candidato: Candidato) => {
        if (!(candidato.id in form.data.candidatos)) {
          form.data.candidatos[candidato.id] = 0;
        }
      });
    } catch (error) {
      console.error('Error loading candidatos:', error);
    }
  }
};

const calculateParticipation = () => {
  // This will be used for display purposes
  if (form.data.total_electores > 0 && form.data.total_votos > 0) {
    // Participation percentage is calculated in computed property
  }
};

const validateVoteTotals = () => {
  // Validation is computed in validationMessage computed property
};

const calculateCandidatePercentage = (candidatoId: number) => {
  const votes = form.data.candidatos[candidatoId] || 0;
  if (form.data.total_votos === 0) return '0.0';
  return ((votes / form.data.total_votos) * 100).toFixed(1);
};

const validateField = (field: string) => {
  const fieldRules = {
    id_mesa: [rules.required('El ID de mesa es requerido')],
    provincia_id: [rules.required('La provincia es requerida')],
    circuito_escuela: [rules.required('El circuito/escuela es requerido')],
    total_electores: [rules.required('El total de electores es requerido'), rules.min(1)],
    total_votos: [rules.required('El total de votos es requerido'), rules.min(0)],
  };

  if (fieldRules[field as keyof typeof fieldRules]) {
    form.validateField(field, fieldRules[field as keyof typeof fieldRules]);
  }
};

const requestRevalidation = () => {
  router.post(`/telegramas/${props.telegrama.id}/request-revalidation`);
};

const submit = () => {
  if (validationMessage.value) return;
  
  // Transform form data for API
  const submitData = {
    ...form.data,
    candidatos: Object.entries(form.data.candidatos).map(([candidato_id, votos]) => ({
      candidato_id: parseInt(candidato_id),
      votos,
    })),
    _method: 'PUT',
  };

  form.post(`/telegramas/${props.telegrama.id}`, {
    data: submitData,
    onSuccess: () => {
      navigate.to('/telegramas');
    },
  });
};

// Initialize
onMounted(() => {
  if (form.data.provincia_id) {
    handleProvinciaChange();
  }
});
</script>