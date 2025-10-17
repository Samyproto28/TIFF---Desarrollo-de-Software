<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Reportes Electorales</h1>
            <p class="mt-2 text-gray-600">Análisis y visualización de datos electorales</p>
          </div>
          <div class="flex space-x-3">
            <Button
              variant="outline"
              @click="exportReport"
              :disabled="!reportData"
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              @click="generateReport"
              :loading="loading"
            >
              Generar Reporte
            </Button>
          </div>
        </div>

        <!-- Filters -->
        <Card class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              v-model="filters.reportType"
              :options="reportTypeOptions"
              placeholder="Tipo de reporte"
              @change="handleReportTypeChange"
            />
            <Select
              v-model="filters.provincia_id"
              :options="provinciaOptions"
              placeholder="Filtrar por provincia"
            />
            <Input
              v-model="filters.dateFrom"
              type="date"
              placeholder="Fecha desde"
            />
            <Input
              v-model="filters.dateTo"
              type="date"
              placeholder="Fecha hasta"
            />
          </div>
          
          <div class="mt-4 flex justify-end space-x-3">
            <Button variant="outline" @click="resetFilters">
              Limpiar Filtros
            </Button>
            <Button variant="primary" @click="applyFilters">
              Aplicar Filtros
            </Button>
          </div>
        </Card>

        <!-- Report Content -->
        <div v-if="loading" class="text-center py-12">
          <LoadingSpinner />
          <p class="mt-4 text-gray-500">Generando reporte...</p>
        </div>

        <div v-else-if="reportData" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div class="p-6">
                <div class="text-sm font-medium text-gray-500">Total Telegramas</div>
                <div class="text-2xl font-bold text-gray-900">{{ reportData.total_telegramas }}</div>
              </div>
            </Card>
            
            <Card>
              <div class="p-6">
                <div class="text-sm font-medium text-gray-500">Participación</div>
                <div class="text-2xl font-bold text-blue-600">{{ reportData.participacion }}%</div>
              </div>
            </Card>
            
            <Card>
              <div class="p-6">
                <div class="text-sm font-medium text-gray-500">Votos Válidos</div>
                <div class="text-2xl font-bold text-green-600">{{ reportData.votos_validos }}</div>
              </div>
            </Card>
            
            <Card>
              <div class="p-6">
                <div class="text-sm font-medium text-gray-500">Mesas Reportadas</div>
                <div class="text-2xl font-bold text-purple-600">{{ reportData.mesas_reportadas }}</div>
              </div>
            </Card>
          </div>

          <!-- Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Participation Chart -->
            <ChartContainer
              type="bar"
              :data="participationChartData"
              :options="participationChartOptions"
              title="Participación por Provincia"
              description="Porcentaje de participación electoral por provincia"
              height="400px"
            />

            <!-- Vote Distribution Chart -->
            <ChartContainer
              type="pie"
              :data="voteDistributionChartData"
              :options="voteDistributionChartOptions"
              title="Distribución de Votos"
              description="Distribución de votos por tipo"
              height="400px"
            />
          </div>

          <!-- Candidate Rankings -->
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Ranking de Candidatos</h3>
            </template>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidato
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provincia
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
                  <tr v-for="(candidato, index) in reportData.candidatos_ranking" :key="candidato.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{{ index + 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ candidato.nombre_completo }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'">
                        {{ candidato.cargo }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ candidato.provincia }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ formatNumber(candidato.votos) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatPercentage(candidato.porcentaje) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <!-- Additional Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Vote Comparison Chart -->
            <ChartContainer
              type="line"
              :data="voteComparisonChartData"
              :options="voteComparisonChartOptions"
              title="Comparación de Votos por Cargo"
              description="Comparación de votos entre Diputados y Senadores"
              height="400px"
            />

            <!-- Province Distribution Chart -->
            <ChartContainer
              type="doughnut"
              :data="provinceDistributionChartData"
              :options="provinceDistributionChartOptions"
              title="Distribución por Provincia"
              description="Distribución de telegramas por provincia"
              height="400px"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</h3>
          <p class="mt-1 text-sm text-gray-500">Selecciona los filtros y genera un reporte para ver los resultados.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useElectoralStore } from '@/stores/electoral';
import { formatNumber, formatPercentage } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import ChartContainer from '@/components/reports/ChartContainer.vue';
import Select from '@/components/ui/Select.vue';
import Input from '@/components/ui/Input.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const electoralStore = useElectoralStore();

// State
const loading = ref(false);
const reportData = ref<any>(null);

// Filters
const filters = ref({
  reportType: 'general',
  provincia_id: null,
  dateFrom: '',
  dateTo: '',
});

// Options
const reportTypeOptions = [
  { value: 'general', label: 'Reporte General' },
  { value: 'provincia', label: 'Reporte por Provincia' },
  { value: 'candidatos', label: 'Ranking de Candidatos' },
  { value: 'participacion', label: 'Participación Electoral' },
];

const provinciaOptions = computed(() => [
  { value: null, label: 'Todas las provincias' },
  ...electoralStore.provincias.map(p => ({ value: p.id, label: p.nombre }))
]);

// Chart data
const participationChartData = computed(() => {
  if (!reportData.value?.participacion_por_provincia) return null;
  
  return {
    labels: reportData.value.participacion_por_provincia.map((p: any) => p.provincia),
    datasets: [{
      label: 'Participación %',
      data: reportData.value.participacion_por_provincia.map((p: any) => p.porcentaje),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };
});

const voteDistributionChartData = computed(() => {
  if (!reportData.value?.distribucion_votos) return null;
  
  return {
    labels: ['Votos Válidos', 'Votos en Blanco', 'Votos Nulos', 'Votos Impugnados'],
    datasets: [{
      data: [
        reportData.value.distribucion_votos.validos,
        reportData.value.distribucion_votos.blanco,
        reportData.value.distribucion_votos.nulos,
        reportData.value.distribucion_votos.impugnados,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(156, 163, 175, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
      ],
      borderWidth: 1,
    }],
  };
});

const voteComparisonChartData = computed(() => {
  if (!reportData.value?.votos_por_cargo) return null;
  
  return {
    labels: reportData.value.votos_por_cargo.map((item: any) => item.provincia),
    datasets: [
      {
        label: 'Diputados',
        data: reportData.value.votos_por_cargo.map((item: any) => item.diputados),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Senadores',
        data: reportData.value.votos_por_cargo.map((item: any) => item.senadores),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };
});

const provinceDistributionChartData = computed(() => {
  if (!reportData.value?.telegramas_por_provincia) return null;
  
  return {
    labels: reportData.value.telegramas_por_provincia.map((p: any) => p.provincia),
    datasets: [{
      data: reportData.value.telegramas_por_provincia.map((p: any) => p.cantidad),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)',
      ],
      borderWidth: 1,
    }],
  };
});

// Chart options
const participationChartOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: number) => `${value}%`,
      },
    },
  },
};

const voteDistributionChartOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

const voteComparisonChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const provinceDistributionChartOptions = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ${value} telegramas`;
        },
      },
    },
  },
};

// Methods
const handleReportTypeChange = () => {
  // Reset provincia filter if not provincia report
  if (filters.value.reportType !== 'provincia') {
    filters.value.provincia_id = null;
  }
};

const applyFilters = () => {
  generateReport();
};

const resetFilters = () => {
  filters.value = {
    reportType: 'general',
    provincia_id: null,
    dateFrom: '',
    dateTo: '',
  };
  reportData.value = null;
};

const generateReport = async () => {
  loading.value = true;
  reportData.value = null;
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('type', filters.value.reportType);
    
    if (filters.value.provincia_id) {
      params.append('provincia_id', String(filters.value.provincia_id));
    }
    
    if (filters.value.dateFrom) {
      params.append('date_from', filters.value.dateFrom);
    }
    
    if (filters.value.dateTo) {
      params.append('date_to', filters.value.dateTo);
    }
    
    // Mock API call for now
    const mockData = await fetchMockReportData(params.toString());
    reportData.value = mockData;
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    loading.value = false;
  }
};

const exportReport = () => {
  if (!reportData.value) return;
  
  const params = new URLSearchParams();
  params.append('type', filters.value.reportType);
  
  if (filters.value.provincia_id) {
    params.append('provincia_id', String(filters.value.provincia_id));
  }
  
  if (filters.value.dateFrom) {
    params.append('date_from', filters.value.dateFrom);
  }
  
  if (filters.value.dateTo) {
    params.append('date_to', filters.value.dateTo);
  }
  
  params.append('format', 'pdf');
  
  // Mock export
  window.open(`/api/v1/reportes/export?${params}`, '_blank');
};

// Mock function for demonstration
const fetchMockReportData = async (queryString: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data based on report type
  if (filters.value.reportType === 'general') {
    return {
      total_telegramas: 1250,
      participacion: 78.5,
      votos_validos: 456789,
      mesas_reportadas: 1150,
      participacion_por_provincia: [
        { provincia: 'Buenos Aires', porcentaje: 82.3 },
        { provincia: 'Córdoba', porcentaje: 76.8 },
        { provincia: 'Santa Fe', porcentaje: 79.2 },
        { provincia: 'Mendoza', porcentaje: 74.5 },
      ],
      distribucion_votos: {
        validos: 456789,
        blanco: 12345,
        nulos: 6789,
        impugnados: 1234,
      },
      candidatos_ranking: [
        {
          id: 1,
          nombre_completo: 'Juan Pérez',
          cargo: 'Diputado',
          provincia: 'Buenos Aires',
          votos: 45678,
          porcentaje: 12.5,
        },
        {
          id: 2,
          nombre_completo: 'María García',
          cargo: 'Senador',
          provincia: 'Córdoba',
          votos: 38901,
          porcentaje: 10.2,
        },
      ],
      votos_por_cargo: [
        { provincia: 'Buenos Aires', diputados: 123456, senadores: 45678 },
        { provincia: 'Córdoba', diputados: 98765, senadores: 38901 },
      ],
      telegramas_por_provincia: [
        { provincia: 'Buenos Aires', cantidad: 450 },
        { provincia: 'Córdoba', cantidad: 320 },
        { provincia: 'Santa Fe', cantidad: 280 },
        { provincia: 'Mendoza', cantidad: 200 },
      ],
    };
  }
  
  // Return empty data for other report types
  return {
    total_telegramas: 0,
    participacion: 0,
    votos_validos: 0,
    mesas_reportadas: 0,
    participacion_por_provincia: [],
    distribucion_votos: { validos: 0, blanco: 0, nulos: 0, impugnados: 0 },
    candidatos_ranking: [],
    votos_por_cargo: [],
    telegramas_por_provincia: [],
  };
};

// Initialize
onMounted(async () => {
  await electoralStore.loadProvincias();
});
</script>