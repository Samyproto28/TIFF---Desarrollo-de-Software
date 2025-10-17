<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <p v-if="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
        </div>
        <div class="flex space-x-2">
          <Button
            v-if="showDownload"
            variant="outline"
            size="sm"
            @click="downloadChart"
          >
            Descargar
          </Button>
          <Button
            v-if="showRefresh"
            variant="outline"
            size="sm"
            @click="refreshData"
            :loading="refreshing"
          >
            Actualizar
          </Button>
        </div>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center" :style="{ height }">
        <LoadingSpinner />
      </div>

      <!-- Empty state -->
      <div v-else-if="!data || !data.datasets || data.datasets.length === 0" class="flex items-center justify-center" :style="{ height }">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
          <p class="mt-1 text-sm text-gray-500">No hay suficientes datos para mostrar el gráfico.</p>
        </div>
      </div>

      <!-- Chart -->
      <div v-else class="relative" :style="{ height }">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

// Register Chart.js components
Chart.register(...registerables);

interface Props {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: ChartData | null;
  options?: ChartOptions;
  title?: string;
  description?: string;
  height?: string;
  showDownload?: boolean;
  showRefresh?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  showDownload: true,
  showRefresh: false,
  loading: false,
});

const emit = defineEmits<{
  refresh: [];
}>();

// State
const chartCanvas = ref<HTMLCanvasElement>();
const chartInstance = ref<Chart | null>(null);
const refreshing = ref(false);

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData && chartInstance.value) {
    updateChart(newData);
  } else if (newData && !chartInstance.value) {
    nextTick(() => {
      createChart();
    });
  }
}, { deep: true });

watch(() => props.options, (newOptions) => {
  if (newOptions && chartInstance.value) {
    chartInstance.value.options = { ...chartInstance.value.options, ...newOptions };
    chartInstance.value.update();
  }
}, { deep: true });

// Methods
const createChart = () => {
  if (!chartCanvas.value || !props.data) return;

  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  // Default options based on chart type
  const defaultOptions = getDefaultOptions();

  // Create new chart
  chartInstance.value = new Chart(chartCanvas.value, {
    type: props.type,
    data: props.data,
    options: {
      ...defaultOptions,
      ...props.options,
    },
  });
};

const updateChart = (newData: ChartData) => {
  if (!chartInstance.value) return;

  chartInstance.value.data = newData;
  chartInstance.value.update();
};

const getDefaultOptions = (): ChartOptions => {
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        intersect: false,
        mode: 'index',
      },
    },
  };

  // Type-specific options
  switch (props.type) {
    case 'bar':
    case 'line':
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      };

    case 'pie':
    case 'doughnut':
      return {
        ...baseOptions,
        cutout: props.type === 'doughnut' ? '50%' : 0,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right',
          },
        },
      };

    case 'radar':
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      };

    case 'polarArea':
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right',
          },
        },
      };

    default:
      return baseOptions;
  }
};

const downloadChart = () => {
  if (!chartInstance.value) return;

  // Create a download link
  const link = document.createElement('a');
  link.download = `${props.title || 'chart'}.png`;
  
  // Convert chart to image
  chartInstance.value.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
};

const refreshData = async () => {
  refreshing.value = true;
  try {
    emit('refresh');
  } finally {
    refreshing.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    if (props.data) {
      createChart();
    }
  });
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>