<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Nuevo Telegrama</h1>
          <p class="mt-2 text-gray-600">Ingrese los datos del telegrama electoral</p>
        </div>

        <!-- Progress Indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                     :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  1
                </div>
                <span class="ml-2 text-sm font-medium">Datos Generales</span>
              </div>
              <div class="ml-8 flex items-center" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                     :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  2
                </div>
                <span class="ml-2 text-sm font-medium">Votos</span>
              </div>
              <div class="ml-8 flex items-center" :class="currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                     :class="currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  3
                </div>
                <span class="ml-2 text-sm font-medium">Confirmación</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                   :style="{ width: (currentStep / 3 * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <Card>
          <form @submit.prevent="submit">
            <!-- Step 1: General Data -->
            <div v-show="currentStep === 1" class="space-y-6">
              <!-- ID Mesa -->
              <div>
                <label for="id_mesa" class="block text-sm font-medium text-gray-700">
                  ID de Mesa *
                </label>
                <Input
                  id="id_mesa"
                  v-model="form.id_mesa"
                  type="text"
                  :error="form.getError('id_mesa')"
                  @blur="validateField('id_mesa')"
                />
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
                  :error="form.getError('provincia_id')"
                  @change="handleProvinciaChange"
                />
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
                  :error="form.getError('total_electores')"
                  @blur="validateField('total_electores')"
                  @input="calculateParticipation"
                />
              </div>
            </div>

            <!-- Step 2: Votes -->
            <div v-show="currentStep === 2" class="space-y-6">
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
            </div>

            <!-- Step 3: Confirmation -->
            <div v-show="currentStep === 3" class="space-y-6">
              <!-- General Data Summary -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen del Telegrama</h3>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">ID Mesa</dt>
                    <dd class="text-sm text-gray-900">{{ form.id_mesa }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Provincia</dt>
                    <dd class="text-sm text-gray-900">{{ selectedProvincia?.nombre }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Circuito/Escuela</dt>
                    <dd class="text-sm text-gray-900">{{ form.circuito_escuela }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Participación</dt>
                    <dd class="text-sm text-gray-900">{{ participationPercentage }}%</dd>
                  </div>
                </dl>
              </div>

              <!-- Vote Summary -->
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen de Votos</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Total Votos:</span>
                    <span class="text-sm font-medium">{{ form.total_votos }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Votos Candidatos:</span>
                    <span class="text-sm font-medium">{{ totalCandidatoVotes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Votos en Blanco:</span>
                    <span class="text-sm font-medium">{{ form.votos_blanco }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Votos Nulos:</span>
                    <span class="text-sm font-medium">{{ form.votos_nulos }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Votos Impugnados:</span>
                    <span class="text-sm font-medium">{{ form.votos_impugnados }}</span>
                  </div>
                </div>
              </div>

              <!-- Candidate Votes Summary -->
              <div v-if="totalCandidatoVotes > 0" class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Votos por Candidato</h3>
                <div class="space-y-3">
                  <div
                    v-for="candidato in candidatosDeProvincia"
                    :key="candidato.id"
                    class="flex justify-between items-center"
                  >
                    <div>
                      <span class="text-sm font-medium text-gray-900">{{ candidato.nombre_completo }}</span>
                      <Badge :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'" class="ml-2" size="sm">
                        {{ candidato.cargo }}
                      </Badge>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">{{ form.candidatos[candidato.id] || 0 }} votos</div>
                      <div class="text-sm text-gray-500">{{ calculateCandidatePercentage(candidato.id) }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-between">
              <Button
                v-if="currentStep > 1"
                variant="outline"
                @click="previousStep"
              >
                Anterior
              </Button>
              <div v-else></div>

              <div class="flex space-x-3">
                <Button variant="outline" @click="navigate.to('/telegramas')">
                  Cancelar
                </Button>
                <Button
                  v-if="currentStep < 3"
                  variant="primary"
                  @click="nextStep"
                  :disabled="!canProceedToNext"
                >
                  Siguiente
                </Button>
                <Button
                  v-if="currentStep === 3"
                  type="submit"
                  variant="primary"
                  :loading="form.processing"
                  :disabled="!!validationMessage"
                >
                  Guardar Telegrama
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from '@/composables/useForm';
import { navigate } from '@/lib/api';
import { rules } from '@/composables/useForm';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Badge from '@/components/ui/Badge.vue';

interface Props {
  provincias: Provincia[];
  candidatos: Candidato[];
}

const props = defineProps<Props>();

// Multi-step form
const currentStep = ref(1);

// Form setup
const initialForm = {
  id_mesa: '',
  provincia_id: null,
  circuito_escuela: '',
  total_electores: 0,
  total_votos: 0,
  votos_blanco: 0,
  votos_nulos: 0,
  votos_impugnados: 0,
  candidatos: {} as Record<number, number>,
};

const form = useForm(initialForm, {
  resetOnSuccess: false,
});

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

const participationPercentage = computed(() => {
  if (form.data.total_electores === 0) return '0.0';
  return ((form.data.total_votos / form.data.total_electores) * 100).toFixed(1);
});

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

const canProceedToNext = computed(() => {
  if (currentStep.value === 1) {
    return form.data.id_mesa && 
           form.data.provincia_id && 
           form.data.circuito_escuela && 
           form.data.total_electores > 0;
  }
  
  if (currentStep.value === 2) {
    return form.data.total_votos > 0 && !validationMessage.value;
  }
  
  return true;
});

// Options
const provinciaOptions = computed(() =>
  props.provincias.map(p => ({ value: p.id, label: p.nombre }))
);

// Methods
const handleProvinciaChange = async () => {
  // Reset candidate votes when province changes
  form.data.candidatos = {};
  
  // Load candidates for selected province
  if (form.data.provincia_id) {
    try {
      const response = await api.get(`/api/v1/provincias/${form.data.provincia_id}/candidatos`);
      response.data.forEach((candidato: Candidato) => {
        form.data.candidatos[candidato.id] = 0;
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

const nextStep = () => {
  if (canProceedToNext.value) {
    currentStep.value++;
  }
};

const previousStep = () => {
  currentStep.value--;
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
  };

  form.post('/telegramas', {
    data: submitData,
    onSuccess: () => {
      navigate.to('/telegramas');
    },
  });
};

// Initialize candidate votes when province is selected
watch(() => form.data.provincia_id, (newProvinciaId) => {
  if (newProvinciaId) {
    handleProvinciaChange();
  }
});
</script>