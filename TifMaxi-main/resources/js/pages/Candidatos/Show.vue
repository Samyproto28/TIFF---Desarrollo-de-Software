<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Detalles del Candidato</h1>
              <p class="mt-2 text-gray-600">Información completa y estadísticas</p>
            </div>
            <div class="flex space-x-3">
              <Button variant="outline" @click="navigate.to('/candidatos')">
                Volver
              </Button>
              <Button variant="primary" @click="navigate.to(`/candidatos/${candidato.id}/edit`)">
                Editar
              </Button>
            </div>
          </div>
        </div>

        <!-- Candidate Information -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Profile Card -->
          <Card class="lg:col-span-1">
            <div class="text-center">
              <div class="flex-shrink-0 mx-auto h-24 w-24">
                <img
                  v-if="candidato.foto"
                  :src="candidato.foto"
                  :alt="candidato.nombre_completo"
                  class="h-24 w-24 rounded-full object-cover mx-auto"
                />
                <div
                  v-else
                  class="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto"
                >
                  <span class="text-gray-600 text-xl font-medium">
                    {{ candidato.nombre_completo.split(' ').map(n => n[0]).join('') }}
                  </span>
                </div>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">{{ candidato.nombre_completo }}</h3>
              <Badge :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'" class="mt-2">
                {{ candidato.cargo }}
              </Badge>
              <div class="mt-4 space-y-2">
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Provincia:</span> {{ candidato.provincia?.nombre || 'No asignada' }}
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Lista/Alianza:</span> {{ candidato.lista_alianza || 'Sin lista' }}
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Creado:</span> {{ formatDate(candidato.created_at) }}
                </div>
              </div>
              <div v-if="candidato.observaciones" class="mt-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">{{ candidato.observaciones }}</p>
              </div>
            </div>
          </Card>

          <!-- Statistics -->
          <Card class="lg:col-span-2">
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Estadísticas Electorales</h3>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Total Votes -->
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ formatNumber(estadisticas.total_votos) }}</div>
                <div class="text-sm text-gray-500 mt-1">Total Votos</div>
              </div>
              
              <!-- Validated Votes -->
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ formatNumber(estadisticas.total_votos_validados) }}</div>
                <div class="text-sm text-gray-500 mt-1">Votos Validados</div>
              </div>
              
              <!-- Percentage -->
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">{{ formatPercentage(estadisticas.porcentaje) }}</div>
                <div class="text-sm text-gray-500 mt-1">Porcentaje</div>
              </div>
            </div>

            <!-- Vote Chart -->
            <div v-if="chartData" class="mt-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">Distribución de Votos</h4>
              <div class="h-64">
                <canvas ref="chartCanvas"></canvas>
              </div>
            </div>
          </Card>
        </div>

        <!-- Associated Telegramas -->
        <Card>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Telegramas Asociados</h3>
              <div class="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="exportTelegramas"
                >
                  Exportar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  @click="navigate.to('/telegramas/create')"
                >
                  Nuevo Telegrama
                </Button>
              </div>
            </div>
          </template>

          <div class="overflow-x-auto">
            <Table
              :data="telegramas.data"
              :columns="telegramasColumns"
              :loading="loadingTelegramas"
            >
              <template #cell-id_mesa="{ value }">
                <span class="font-mono text-sm">{{ value }}</span>
              </template>

              <template #cell-circuito_escuela="{ value }">
                <div class="text-sm text-gray-900">{{ value }}</div>
              </template>

              <template #cell-estado="{ value }">
                <Badge
                  :variant="getEstadoVariant(value)"
                  size="sm"
                >
                  {{ value }}
                </Badge>
              </template>

              <template #cell-votos="{ row }">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatNumber(row.candidato_telegrama?.pivot?.votos || 0) }}
                </div>
              </template>

              <template #cell-acciones="{ row }">
                <div class="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="navigate.to(`/telegramas/${row.id}`)"
                  >
                    Ver
                  </Button>
                </div>
              </template>
            </Table>
          </div>

          <!-- Pagination -->
          <div v-if="telegramas.last_page > 1" class="px-6 py-4">
            <Pagination
              :current-page="telegramas.current_page"
              :total-pages="telegramas.last_page"
              :total="telegramas.total"
              :per-page="telegramas.per_page"
              @update:current-page="goToTelegramasPage"
            />
          </div>

          <!-- Empty State -->
          <div v-if="telegramas.data.length === 0 && !loadingTelegramas" class="text-center py-8">
            <div class="text-gray-400">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay telegramas</h3>
            <p class="mt-1 text-sm text-gray-500">Este candidato no tiene telegramas asociados aún.</p>
            <div class="mt-6">
              <Button variant="primary" @click="navigate.to('/telegramas/create')">
                Crear Telegrama
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { router } from '@inertiajs/vue3';
import { navigate, formatNumber, formatPercentage, formatDate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Table from '@/components/ui/Table.vue';
import Pagination from '@/components/ui/Pagination.vue';

// Register Chart.js components
Chart.register(...registerables);

interface Props {
  candidato: Candidato;
  estadisticas: {
    total_votos: number;
    total_votos_validados: number;
    porcentaje: number;
  };
  votos: Array<{
    telegrama_id: number;
    id_mesa: string;
    votos: number;
    estado: string;
  }>;
  telegramas: PaginatedResponse<Telegrama>;
}

const props = defineProps<Props>();

// State
const loadingTelegramas = ref(false);
const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

// Computed
const chartData = computed(() => {
  if (!props.votos.length) return null;
  
  const estados = props.votos.reduce((acc, voto) => {
    acc[voto.estado] = (acc[voto.estado] || 0) + voto.votos;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(estados),
    datasets: [{
      label: 'Votos por Estado',
      data: Object.values(estados),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(156, 163, 175, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 1,
    }],
  };
});

// Table columns
const telegramasColumns = [
  { key: 'id_mesa', label: 'ID Mesa', sortable: true },
  { key: 'circuito_escuela', label: 'Circuito/Escuela', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'votos', label: 'Votos', sortable: true },
  { key: 'acciones', label: 'Acciones', sortable: false },
];

// Methods
const getEstadoVariant = (estado: string) => {
  switch (estado) {
    case 'validado': return 'success';
    case 'pendiente': return 'warning';
    case 'rechazado': return 'danger';
    default: return 'secondary';
  }
};

const createChart = () => {
  if (!chartCanvas.value || !chartData.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${formatNumber(value)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
};

const goToTelegramasPage = (page: number) => {
  loadingTelegramas.value = true;
  
  router.get(`/candidatos/${props.candidato.id}`, {
    page,
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loadingTelegramas.value = false;
    },
  });
};

const exportTelegramas = () => {
  const params = new URLSearchParams({
    candidato_id: String(props.candidato.id),
    format: 'csv',
  });
  
  window.open(`/api/v1/telegramas/export/csv?${params}`, '_blank');
};

// Initialize chart on mount
onMounted(() => {
  nextTick(() => {
    createChart();
  });
});
</script>